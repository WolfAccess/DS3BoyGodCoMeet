import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Meeting = {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  status: 'active' | 'completed' | 'archived';
  owner_id: string;
  is_bookmarked: boolean;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  meeting_id: string;
  name: string;
  speak_time_seconds: number;
  sentiment_score: number;
  created_at: string;
};

export type Transcript = {
  id: string;
  meeting_id: string;
  participant_id: string;
  content: string;
  timestamp: string;
  emotion: 'calm' | 'tense' | 'enthusiastic' | 'neutral';
  sentiment_type?: 'conflict' | 'agreement' | 'neutral';
  created_at: string;
};

export type ActionItem = {
  id: string;
  meeting_id: string;
  participant_id?: string;
  content: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
};

export type MeetingAnalytics = {
  id: string;
  meeting_id: string;
  emotion_timeline: Array<{ time: string; emotion: string }>;
  speaker_balance: Record<string, number>;
  conflict_moments: Array<{ time: string; content: string }>;
  agreement_moments: Array<{ time: string; content: string }>;
  key_decisions: Array<{ time: string; decision: string }>;
  updated_at: string;
};

export type KeyPoint = {
  id: string;
  meeting_id: string;
  transcript_id?: string;
  type: 'decision' | 'action' | 'question' | 'important' | 'agreement' | 'concern';
  text: string;
  snippet: string;
  speaker_name: string;
  created_at: string;
};

export type MeetingInvite = {
  id: string;
  meeting_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  created_at: string;
  updated_at: string;
};
