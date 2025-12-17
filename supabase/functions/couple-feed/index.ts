// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop(); // 'current' or 'swipe'

    // 1. Auth Check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No auth header')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Get User's Couple
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (coupleError || !couple) throw new Error('User not in a couple')

    // ROUTE: GET /current
    if (req.method === 'GET' && path === 'current') {
      const category = url.searchParams.get('category');
      if (!category) throw new Error('Category required');

      // A) Get or Initialize State
      let { data: state } = await supabase
        .from('couple_feed_state')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('category', category)
        .single();

      if (!state) {
        // Initialize state
        const { data: newState, error: initError } = await supabase
          .from('couple_feed_state')
          .insert({ couple_id: couple.id, category, current_index: 0 })
          .select()
          .single();
        if (initError) throw initError;
        state = newState;
      }

      // B) Ensure Feed Items Exist (Lazy Loading)
      const { count } = await supabase
        .from('couple_feed_items')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', couple.id)
        .eq('category', category)
        .eq('feed_version', state.feed_version);

      if (count === 0) {
        // GENERATE FEED: Fetch activities in category, shuffle, insert
        // Note: In prod, limit this fetch or use a random sampler fn
        const { data: activities } = await supabase
          .from('activities')
          .select('id')
          .eq('category', category)
          .eq('is_active', true);

        if (!activities || activities.length === 0) {
             // Handle empty category gracefully
             return new Response(JSON.stringify({ activity: null, empty: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
             });
        }

        // Shuffle
        const shuffled = activities.sort(() => 0.5 - Math.random());
        
        const feedItems = shuffled.map((a: any, idx: number) => ({
            couple_id: couple.id,
            category,
            feed_version: state.feed_version,
            position: idx,
            activity_id: a.id
        }));

        await supabase.from('couple_feed_items').insert(feedItems);
      }

      // C) Fetch Current Item
      const { data: currentItem } = await supabase
        .from('couple_feed_items')
        .select('activity_id, activities(*)') // Join to get details
        .eq('couple_id', couple.id)
        .eq('category', category)
        .eq('feed_version', state.feed_version)
        .eq('position', state.current_index)
        .single();

      return new Response(JSON.stringify({
        activity: currentItem ? currentItem.activities : null,
        feedState: state,
        nextIndex: state.current_index + 1
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ROUTE: POST /swipe
    if (req.method === 'POST' && path === 'swipe') {
      const { category, activityId, direction, expectedIndex } = await req.json();

      // Optimistic Locking Check
      const { data: state } = await supabase
        .from('couple_feed_state')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('category', category)
        .single();

      if (state.current_index !== expectedIndex) {
          // Client out of sync
          return new Response(JSON.stringify({ error: 'Out of sync', currentState: state }), { 
              status: 409, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      // Verify activity ID matches the slot (Integrity Check)
      const { data: currentItem } = await supabase
        .from('couple_feed_items')
        .select('activity_id')
        .eq('couple_id', couple.id)
        .eq('category', category)
        .eq('position', state.current_index)
        .single();
        
      if (!currentItem || currentItem.activity_id !== activityId) {
           return new Response(JSON.stringify({ error: 'Activity mismatch' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }

      // Record Swipe
      const { error: swipeError } = await supabase.from('swipes').insert({
          couple_id: couple.id,
          user_id: user.id,
          category,
          activity_id: activityId,
          direction
      });

      if (swipeError) throw swipeError;

      // Advance Index
      const { data: newState, error: updateError } = await supabase
          .from('couple_feed_state')
          .update({ current_index: state.current_index + 1, updated_at: new Date() })
          .eq('id', state.id)
          .select()
          .single();

      if (updateError) throw updateError;

      // Return next card logic (simplified: just return success and client calls GET /current)
      // Or return the next card here to save an RTT
      return new Response(JSON.stringify({ success: true, feedState: newState }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Method not allowed');

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})