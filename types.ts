export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  howTo?: string;
  tip?: string;
  tags: string[];
  imageUrl?: string;
  is_active: boolean;
}

export interface Couple {
  id: string;
  user1_id: string;
  user2_id?: string;
  code: string; // Invite code
}

export interface User {
  id: string;
  email: string;
  couple_id?: string;
  role: 'admin' | 'user';
  is_premium: boolean;
}

export interface Swipe {
  category: string;
  activity_id: string;
  direction: 'like' | 'dislike' | 'superlike';
}

export interface FeedState {
  current_index: number;
  total_items: number;
  is_finished: boolean;
}

export interface FeedResponse {
  activity: Activity | null;
  feedState: FeedState;
  nextIndex: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalCouples: number;
  premiumUsers: number;
}