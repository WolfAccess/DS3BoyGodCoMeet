/*
  # Add User Profiles and Authentication

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Changes
    - Update meetings table to require owner_id
    - Update RLS policies to use authenticated user IDs
    
  3. Security
    - Enable RLS on profiles table
    - Users can only read and update their own profile
    - Meetings are now tied to authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Drop public policies
DROP POLICY IF EXISTS "Anyone can view meetings" ON meetings;
DROP POLICY IF EXISTS "Anyone can create meetings" ON meetings;
DROP POLICY IF EXISTS "Anyone can update meetings" ON meetings;
DROP POLICY IF EXISTS "Anyone can delete meetings" ON meetings;

DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
DROP POLICY IF EXISTS "Anyone can create participants" ON participants;
DROP POLICY IF EXISTS "Anyone can update participants" ON participants;

DROP POLICY IF EXISTS "Anyone can view transcripts" ON transcripts;
DROP POLICY IF EXISTS "Anyone can create transcripts" ON transcripts;

DROP POLICY IF EXISTS "Anyone can view action items" ON action_items;
DROP POLICY IF EXISTS "Anyone can create action items" ON action_items;
DROP POLICY IF EXISTS "Anyone can update action items" ON action_items;

DROP POLICY IF EXISTS "Anyone can view analytics" ON meeting_analytics;
DROP POLICY IF EXISTS "Anyone can create analytics" ON meeting_analytics;
DROP POLICY IF EXISTS "Anyone can update analytics" ON meeting_analytics;

-- Create authenticated user policies for meetings
CREATE POLICY "Authenticated users can view own meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can update own meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can delete own meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Participants policies
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

-- Transcripts policies
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

-- Action items policies
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

-- Meeting analytics policies
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

-- Create index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);