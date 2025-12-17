import { supabase } from './supabaseClient';
import { Activity, Couple, FeedResponse, User, DashboardStats, Difficulty } from '../types';

// Fallback seed data in case DB is empty, ensuring the app doesn't crash on first run
const LOCAL_SEED_ACTIVITIES: Activity[] = [
  { id: 'a1', title: 'Cook Pasta', description: 'Homemade sauce.', category: 'casa', difficulty: Difficulty.Medium, tags: ['cooking'], is_active: true },
  { id: 'a2', title: 'Board Games', description: 'Play Catan.', category: 'casa', difficulty: Difficulty.Easy, tags: ['fun'], is_active: true },
  { id: 'h1', title: 'Massage', description: 'Relaxing oil massage.', category: 'hot', difficulty: Difficulty.Easy, tags: ['intimate'], is_active: true },
  { id: 'h2', title: 'Doggy Style', description: 'Classic position.', category: 'hot', difficulty: Difficulty.Medium, tags: ['position'], is_active: true },
];

export const mockAuth = {
  login: async (email: string, password?: string): Promise<User> => {
    // 1. Try to Login
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'password123', // Fallback pass if not provided in UI (mock flow)
    });

    // 2. If login fails, try to Sign Up (Auto-register flow compatibility)
    if (error) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: password || 'password123',
      });
      
      if (signUpError) throw signUpError;
      data = signUpData;
    }

    if (!data.user) throw new Error("Authentication failed");

    // 3. Fetch Profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email || '',
      role: profile?.role || 'user',
      is_premium: profile?.is_premium || false,
      couple_id: profile?.couple_id
    };
  }
};

export const mockCoupleService = {
  createCouple: async (userId: string) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 1. Create Couple
    const { data: couple, error } = await supabase
      .from('couples')
      .insert({ user1_id: userId, code })
      .select()
      .single();

    if (error) throw error;

    // 2. Update User Profile
    await supabase
      .from('profiles')
      .update({ couple_id: couple.id })
      .eq('id', userId);

    return couple as Couple;
  },

  joinCouple: async (userId: string, code: string) => {
    // 1. Find Couple
    const { data: couple, error } = await supabase
      .from('couples')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !couple) throw new Error("Invalid invite code");
    if (couple.user2_id) throw new Error("Couple already full");

    // 2. Join
    const { data: updatedCouple, error: updateError } = await supabase
      .from('couples')
      .update({ user2_id: userId })
      .eq('id', couple.id)
      .select()
      .single();
    
    if (updateError) throw updateError;

    // 3. Update User Profile
    await supabase
      .from('profiles')
      .update({ couple_id: couple.id })
      .eq('id', userId);

    return updatedCouple as Couple;
  },

  getCouple: async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', userId).single();
    if (!profile?.couple_id) return null;

    const { data: couple } = await supabase.from('couples').select('*').eq('id', profile.couple_id).single();
    return couple as Couple;
  }
};

export const mockFeedService = {
  getCurrentActivity: async (coupleId: string | null | undefined, userId: string, category: string): Promise<FeedResponse> => {
    // 1. Get User State (Index)
    let { data: state } = await supabase
      .from('feed_state')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    // Initialize state if not exists
    if (!state) {
        const { data: newState } = await supabase
            .from('feed_state')
            .insert({ user_id: userId, couple_id: coupleId || null, category, current_index: 0 })
            .select()
            .single();
        state = newState;
    }

    const currentIndex = state?.current_index || 0;

    // 2. Fetch Activity from DB (Simple pagination by Offset)
    // Note: In a real production app, you'd want a deterministic random seed per couple.
    // For this V1, we simply order by ID to keep it consistent between partners.
    const { data: activities, count } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })
      .eq('category', category)
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(currentIndex, currentIndex); // Limit 1

    // Fallback if DB is empty (use local seed so app works immediately)
    if (!activities || activities.length === 0) {
       // Check if we exhausted the list
       const { count: total } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('category', category);
       
       if (total && currentIndex >= total) {
         return {
            activity: null,
            feedState: { current_index: currentIndex, total_items: total || 0, is_finished: true },
            nextIndex: currentIndex
         };
       }

       // Use local seed for demo if table is empty
       const localAct = LOCAL_SEED_ACTIVITIES.filter(a => a.category === category)[currentIndex];
       if (localAct) {
         return {
            activity: localAct,
            feedState: { current_index: currentIndex, total_items: 10, is_finished: false },
            nextIndex: currentIndex + 1
         };
       }
       
       return {
         activity: null,
         feedState: { current_index: currentIndex, total_items: 0, is_finished: true },
         nextIndex: currentIndex
       };
    }

    return {
      activity: activities[0] as Activity,
      feedState: { 
        current_index: currentIndex, 
        total_items: count || 999, 
        is_finished: false 
      },
      nextIndex: currentIndex + 1
    };
  },

  swipe: async (coupleId: string | null | undefined, userId: string, category: string, activityId: string, direction: string, expectedIndex: number) => {
    
    // 1. Save Swipe (Only if couple exists)
    if (coupleId) {
        await supabase.from('swipes').insert({
            couple_id: coupleId,
            user_id: userId,
            category,
            activity_id: activityId,
            direction
        });
    }

    // 2. Advance Index
    await supabase
        .from('feed_state')
        .update({ current_index: expectedIndex + 1 })
        .eq('user_id', userId)
        .eq('category', category);

    // 3. Return next
    return mockFeedService.getCurrentActivity(coupleId, userId, category);
  },

  resetFeed: async (coupleId: string, category: string) => {
     // Admin helper
  }
};

export const mockAdminService = {
    getStats: async (): Promise<DashboardStats> => {
        const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: couples } = await supabase.from('couples').select('*', { count: 'exact', head: true });
        const { count: premium } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true);
        
        return {
            totalUsers: users || 0,
            totalCouples: couples || 0,
            premiumUsers: premium || 0
        };
    },

    getAllUsers: async (): Promise<User[]> => {
        const { data } = await supabase.from('profiles').select('*');
        return data?.map(p => ({
            id: p.id,
            email: p.email,
            role: p.role,
            is_premium: p.is_premium,
            couple_id: p.couple_id
        })) || [];
    },

    togglePremium: async (userId: string, status: boolean): Promise<User> => {
        const { data } = await supabase
            .from('profiles')
            .update({ is_premium: status })
            .eq('id', userId)
            .select()
            .single();
        return data as any;
    },

    getActivities: async (): Promise<Activity[]> => {
        const { data } = await supabase.from('activities').select('*');
        return data as Activity[] || [];
    }
};