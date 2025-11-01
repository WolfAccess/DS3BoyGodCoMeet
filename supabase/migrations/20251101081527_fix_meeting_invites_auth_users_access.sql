/*
  # Fix Meeting Invites RLS Policies

  1. Changes
    - Drop existing policies that reference auth.users table
    - Recreate policies using auth.email() instead
    - This avoids permission denied errors when querying auth.users

  2. Security
    - Maintains same security model
    - Users can view and update invites sent to their email
    - Meeting owners can manage all invites for their meetings
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view invites sent to their email" ON meeting_invites;
DROP POLICY IF EXISTS "Users can update their own invite status" ON meeting_invites;

-- Recreate with auth.email() which doesn't require auth.users access
CREATE POLICY "Users can view invites sent to their email"
  ON meeting_invites FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "Users can update their own invite status"
  ON meeting_invites FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());
