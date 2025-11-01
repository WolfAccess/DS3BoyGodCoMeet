/*
  # Add Key Points Table

  1. New Tables
    - `key_points`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings)
      - `transcript_id` (uuid, foreign key to transcripts)
      - `type` (text) - decision, action, question, important, agreement, concern
      - `text` (text) - full transcript text
      - `snippet` (text) - extracted key point snippet
      - `speaker_name` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on key_points table
    - Users can only access key points from their own meetings
*/

CREATE TABLE IF NOT EXISTS key_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  transcript_id uuid REFERENCES transcripts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('decision', 'action', 'question', 'important', 'agreement', 'concern')),
  text text NOT NULL,
  snippet text NOT NULL,
  speaker_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE key_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view key points from own meetings"
  ON key_points FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = key_points.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create key points in own meetings"
  ON key_points FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = key_points.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete key points from own meetings"
  ON key_points FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = key_points.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_key_points_meeting ON key_points(meeting_id);
CREATE INDEX IF NOT EXISTS idx_key_points_type ON key_points(type);
CREATE INDEX IF NOT EXISTS idx_key_points_created ON key_points(created_at);