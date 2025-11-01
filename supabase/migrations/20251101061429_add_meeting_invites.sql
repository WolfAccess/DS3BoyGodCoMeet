/*
  # Add Meeting Invites Feature

  1. New Tables
    - `meeting_invites`
      - `id` (uuid, primary key)
      - `meeting_id` (uuid, foreign key to meetings)
      - `email` (text, email address of invitee)
      - `status` (text, one of: pending, accepted, declined)
      - `invited_at` (timestamptz, when invite was sent)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `meeting_invites` table
    - Add policy for authenticated users to view invites for their meetings
    - Add policy for authenticated users to create invites for their meetings
    - Add policy for authenticated users to delete invites for their meetings
    - Add policy for users to view invites sent to their email
    - Add policy for users to update their own invite status
  
  3. Notes
    - Users can invite others to their meetings via email
    - Invited users can accept or decline invitations
*/

CREATE TABLE IF NOT EXISTS meeting_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(meeting_id, email)
);

ALTER TABLE meeting_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meeting owners can view invites for their meetings"
  ON meeting_invites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_invites.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Meeting owners can create invites for their meetings"
  ON meeting_invites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_invites.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Meeting owners can delete invites for their meetings"
  ON meeting_invites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_invites.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view invites sent to their email"
  ON meeting_invites FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their own invite status"
  ON meeting_invites FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_meeting_invites_meeting_id ON meeting_invites(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invites_email ON meeting_invites(email);