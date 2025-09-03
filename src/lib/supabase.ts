import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  timezone: string;
  created_at: string;
}

export interface Cycle {
  id: string;
  user_id: string;
  name?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface Habit {
  id: string;
  cycle_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  cycle_id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  cycle_id: string;
  date: string;
  prompt_id?: string;
  content: string;
  mood?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface XpEvent {
  id: string;
  cycle_id: string;
  date: string;
  source: 'completion' | 'streak_bonus' | 'badge';
  amount: number;
  created_at: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  criteria_json: Record<string, any>;
}

export interface UserBadge {
  id: string;
  user_id: string;
  cycle_id?: string;
  badge_id: string;
  awarded_at: string;
}

export interface Settings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  prompt_pack: string;
  notifications: Record<string, any>;
}

export interface Prompt {
  id: string;
  pack: string;
  type: 'morning' | 'evening' | 'general';
  text: string;
}