import { create } from 'zustand';
import { User, Couple } from '../types';
import { mockAuth, mockCoupleService } from './mockBackend';
import { supabase } from './supabaseClient';

interface AuthState {
  user: User | null;
  couple: Couple | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User | undefined>;
  logout: () => void;
  refreshCouple: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  couple: null,
  isLoading: false,

  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const user = await mockAuth.login(email, password);
      // Get couple if exists
      const couple = await mockCoupleService.getCouple(user.id);
      set({ user, couple, isLoading: false });
      return user;
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
      throw e; 
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, couple: null });
  },

  refreshCouple: async () => {
    const { user } = get();
    if (!user) return;
    const couple = await mockCoupleService.getCouple(user.id);
    set({ couple });
  },

  checkSession: async () => {
      // Restore session on app load
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
              const user = {
                id: session.user.id,
                email: session.user.email || '',
                role: profile.role,
                is_premium: profile.is_premium,
                couple_id: profile.couple_id
              };
              // Get couple
              let couple = null;
              if (user.couple_id) {
                 const { data: c } = await supabase.from('couples').select('*').eq('id', user.couple_id).single();
                 couple = c;
              }
              set({ user, couple });
          }
      }
  }
}));

// Initialize session check
useAuthStore.getState().checkSession();