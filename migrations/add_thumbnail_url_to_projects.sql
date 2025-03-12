-- Add thumbnail_url column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add comment to the column for documentation
COMMENT ON COLUMN projects.thumbnail_url IS 'URL to the project website thumbnail image stored in Supabase storage';

-- Update RLS policies to allow access to the new column
-- This assumes you have existing RLS policies for the projects table
-- If your policies use column-level security, make sure to include the new column

-- Example of updating a select policy to include the new column:
-- CREATE POLICY "Users can view their own projects" ON projects
--   FOR SELECT USING (auth.uid() = user_id);

-- Example of updating an update policy to include the new column:
-- CREATE POLICY "Users can update their own projects" ON projects
--   FOR UPDATE USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id); 