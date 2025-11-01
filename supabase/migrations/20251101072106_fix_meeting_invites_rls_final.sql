/*
  # Fix Meeting Invites RLS - Final Fix
  
  1. Changes
    - Drop ALL existing meeting_invites policies
    - Create simpler policies that don't query auth.users table
    - Use only auth.uid() and auth.jwt() for authentication checks
  
  2. Security
    - Meeting owners can manage all invites for their meetings
    - No cross-table queries to auth.users
*/

-- Drop all existing policies on meeting_invites
DROP POLICY IF EXISTS "Meeting owners can view invites for their meetings" ON meeting_invites;
DROP POLICY IF EXISTS "Meeting owners can create invites for their meetings" ON meeting_invites;
DROP POLICY IF EXISTS "Meeting owners can delete invites for their meetings" ON meeting_invites;
DROP POLICY IF EXISTS "Users can view invites sent to their email" ON meeting_invites;
DROP POLICY IF EXISTS "Users can update their own invite status" ON meeting_invites;

-- Create new simplified policies
CREATE POLICY "Meeting owners can manage invites"
  ON meeting_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_invites.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_invites.meeting_id
      AND meetings.owner_id = auth.uid()
    )
  );
