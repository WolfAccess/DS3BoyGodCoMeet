/*
  # Add Meeting Bookmarks

  1. Changes
    - Add `is_bookmarked` column to meetings table
    - Default value is false
    - Column is NOT NULL with default
  
  2. Notes
    - No RLS changes needed as meetings table already has proper policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meetings' AND column_name = 'is_bookmarked'
  ) THEN
    ALTER TABLE meetings ADD COLUMN is_bookmarked boolean DEFAULT false NOT NULL;
  END IF;
END $$;