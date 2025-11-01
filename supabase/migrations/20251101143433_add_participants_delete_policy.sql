/*
  # Add delete policy for participants

  1. Changes
    - Add RLS policy to allow users to delete participants in their own meetings
  
  2. Security
    - Users can only delete participants from meetings they own
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'participants' 
    AND policyname = 'Users can delete participants in own meetings'
  ) THEN
    CREATE POLICY "Users can delete participants in own meetings"
      ON participants FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM meetings
          WHERE meetings.id = participants.meeting_id
          AND meetings.owner_id = auth.uid()
        )
      );
  END IF;
END $$;