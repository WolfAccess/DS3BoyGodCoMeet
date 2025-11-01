/*
  # Update action items to cascade delete with participant

  1. Changes
    - Change foreign key constraint on action_items.participant_id
    - Update from ON DELETE SET NULL to ON DELETE CASCADE
    - This ensures all action items are removed when a participant is deleted
  
  2. Security
    - No RLS changes needed
    - Maintains existing access controls
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'action_items_participant_id_fkey'
    AND table_name = 'action_items'
  ) THEN
    ALTER TABLE action_items 
    DROP CONSTRAINT action_items_participant_id_fkey;
    
    ALTER TABLE action_items
    ADD CONSTRAINT action_items_participant_id_fkey
    FOREIGN KEY (participant_id)
    REFERENCES participants(id)
    ON DELETE CASCADE;
  END IF;
END $$;