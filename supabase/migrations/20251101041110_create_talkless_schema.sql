/*
  # TalkLess Meeting Analysis System

  1. New Tables
    - `meetings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz, nullable)
      - `status` (text: 'active', 'completed', 'archived')
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `participants`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, references meetings)
      - `name` (text)
      - `speak_time_seconds` (integer, default 0)
      - `sentiment_score` (numeric, default 0)
      - `created_at` (timestamptz)
    
    - `transcripts`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, references meetings)
      - `participant_id` (uuid, references participants)
      - `content` (text)
      - `timestamp` (timestamptz)
      - `emotion` (text: 'calm', 'tense', 'enthusiastic', 'neutral')
      - `sentiment_type` (text: 'conflict', 'agreement', 'neutral', nullable)
      - `created_at` (timestamptz)
    
    - `action_items`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, references meetings)
      - `participant_id` (uuid, references participants, nullable)
      - `content` (text)
      - `due_date` (timestamptz, nullable)
      - `completed` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `meeting_analytics`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, references meetings)
      - `emotion_timeline` (jsonb, default '[]')
      - `speaker_balance` (jsonb, default '{}')
      - `conflict_moments` (jsonb, default '[]')
      - `agreement_moments` (jsonb, default '[]')
      - `key_decisions` (jsonb, default '[]')
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own meetings
    - Public read access for shared meetings (future feature)
*/

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  speak_time_seconds integer DEFAULT 0,
  sentiment_score numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  emotion text DEFAULT 'neutral' CHECK (emotion IN ('calm', 'tense', 'enthusiastic', 'neutral')),
  sentiment_type text CHECK (sentiment_type IN ('conflict', 'agreement', 'neutral')),
  created_at timestamptz DEFAULT now()
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  participant_id uuid REFERENCES participants(id) ON DELETE SET NULL,
  content text NOT NULL,
  due_date timestamptz,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create meeting_analytics table
CREATE TABLE IF NOT EXISTS meeting_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  emotion_timeline jsonb DEFAULT '[]',
  speaker_balance jsonb DEFAULT '{}',
  conflict_moments jsonb DEFAULT '[]',
  agreement_moments jsonb DEFAULT '[]',
  key_decisions jsonb DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
CREATE POLICY "Users can view own meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for participants
CREATE POLICY "Users can view participants in own meetings"
  ON participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create participants in own meetings"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update participants in own meetings"
  ON participants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = participants.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

-- RLS Policies for transcripts
CREATE POLICY "Users can view transcripts in own meetings"
  ON transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = transcripts.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transcripts in own meetings"
  ON transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = transcripts.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

-- RLS Policies for action_items
CREATE POLICY "Users can view action items in own meetings"
  ON action_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create action items in own meetings"
  ON action_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update action items in own meetings"
  ON action_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

-- RLS Policies for meeting_analytics
CREATE POLICY "Users can view analytics for own meetings"
  ON meeting_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_analytics.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analytics for own meetings"
  ON meeting_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_analytics.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analytics for own meetings"
  ON meeting_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_analytics.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_analytics.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meetings_owner_id ON meetings(owner_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_meeting_id ON transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_timestamp ON transcripts(timestamp);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_analytics_meeting_id ON meeting_analytics(meeting_id);