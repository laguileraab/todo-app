-- Complete database setup script for the Todo App
-- This script creates all necessary tables, indexes, and enables real-time functionality

-------------------------
-- Create todos table
-------------------------
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-------------------------
-- Security settings
-------------------------
-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own todos
DO $$ 
BEGIN
  -- Drop the policy if it exists to avoid errors when re-running
  BEGIN
    DROP POLICY IF EXISTS "Users can only access their own todos" ON todos;
  EXCEPTION
    WHEN undefined_object THEN
      -- Policy doesn't exist, continue
  END;
  
  -- Create the policy
  CREATE POLICY "Users can only access their own todos" 
    ON todos FOR ALL 
    USING (auth.uid() = user_id);
END $$;

-------------------------
-- Indexes for performance
-------------------------
-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos (user_id);

-- Create index for position ordering
CREATE INDEX IF NOT EXISTS todos_position_idx ON todos (position);

-------------------------
-- Real-time functionality
-------------------------
-- Enable real-time for todos table
BEGIN
  -- Try to add the table to existing publication
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE todos;
  EXCEPTION
    WHEN undefined_object THEN
      -- Publication doesn't exist, create it
      CREATE PUBLICATION supabase_realtime FOR TABLE todos;
  END;
END;

-------------------------
-- Verify setup
-------------------------
-- Verify position column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'todos' 
  AND column_name = 'position';

-- Verify real-time is enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Update any existing todos that don't have a position
WITH indexed_todos AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) - 1 as row_num
  FROM todos
  WHERE position IS NULL OR position = 0
)
UPDATE todos
SET position = indexed_todos.row_num
FROM indexed_todos
WHERE todos.id = indexed_todos.id;

-- Output setup confirmation message
DO $$
BEGIN
  RAISE NOTICE 'Todo app database setup complete.';
  RAISE NOTICE 'The following has been configured:';
  RAISE NOTICE '1. todos table with all required columns';
  RAISE NOTICE '2. Row Level Security (RLS) enabled';
  RAISE NOTICE '3. User-based access policy created';
  RAISE NOTICE '4. Performance indexes created';
  RAISE NOTICE '5. Real-time functionality enabled';
END $$; 