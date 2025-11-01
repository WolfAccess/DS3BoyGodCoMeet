/*
  # Fix Meeting Invites RLS Policies

  1. Changes
    - Drop existing policies that access auth.users
    - Recreate policies using auth.jwt() to get user email
    - This avoids permission errors when accessing auth.users table

  2. Security
    - Meeting owners can still manage invites for their meetings
    - Invited users can view and update invites sent to their email
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view invites sent to their email" ON meeting_invites;
DROP POLICY IF EXISTS "Users can update their own invite status" ON meeting_invites;

-- Recreate policies using auth.jwt() instead of auth.users
CREATE POLICY "Users can view invites sent to their email"
  ON meeting_invites FOR SELECT
  TO authenticated
  USING (
    email = (auth.jwt()->>'email')::text
  );

CREATE POLICY "Users can update their own invite status"
  ON meeting_invites FOR UPDATE
  TO authenticated
  USING (
    email = (auth.jwt()->>'email')::text
  )
  WITH CHECK (
    email = (auth.jwt()->>'email')::text
  );