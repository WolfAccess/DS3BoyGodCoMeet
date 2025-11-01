/*
  # Enable Public Access for TalkLess

  1. Changes
    - Drop all existing RLS policies that require authentication
    - Create new policies that allow public access (anon role)
    - Make owner_id nullable for meetings table
    
  2. Security Note
    - This enables anyone to create and view meetings
    - Suitable for demo/prototype purposes
    - For production, implement proper authentication
*/

-- Make owner_id nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE meetings ALTER COLUMN owner_id DROP NOT NULL;
  END IF;
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can create own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can delete own meetings" ON meetings;

DROP POLICY IF EXISTS "Users can view participants in own meetings" ON participants;
DROP POLICY IF EXISTS "Users can create participants in own meetings" ON participants;
DROP POLICY IF EXISTS "Users can update participants in own meetings" ON participants;

DROP POLICY IF EXISTS "Users can view transcripts in own meetings" ON transcripts;
DROP POLICY IF EXISTS "Users can create transcripts in own meetings" ON transcripts;

DROP POLICY IF EXISTS "Users can view action items in own meetings" ON action_items;
DROP POLICY IF EXISTS "Users can create action items in own meetings" ON action_items;
DROP POLICY IF EXISTS "Users can update action items in own meetings" ON action_items;

DROP POLICY IF EXISTS "Users can view analytics for own meetings" ON meeting_analytics;
DROP POLICY IF EXISTS "Users can create analytics for own meetings" ON meeting_analytics;
DROP POLICY IF EXISTS "Users can update analytics for own meetings" ON meeting_analytics;

-- Create new public policies for meetings
CREATE POLICY "Anyone can view meetings"
  ON meetings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create meetings"
  ON meetings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update meetings"
  ON meetings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete meetings"
  ON meetings FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create new public policies for participants
CREATE POLICY "Anyone can view participants"
  ON participants FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create participants"
  ON participants FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update participants"
  ON participants FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create new public policies for transcripts
CREATE POLICY "Anyone can view transcripts"
  ON transcripts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create transcripts"
  ON transcripts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create new public policies for action_items
CREATE POLICY "Anyone can view action items"
  ON action_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create action items"
  ON action_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update action items"
  ON action_items FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create new public policies for meeting_analytics
CREATE POLICY "Anyone can view analytics"
  ON meeting_analytics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create analytics"
  ON meeting_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update analytics"
  ON meeting_analytics FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);