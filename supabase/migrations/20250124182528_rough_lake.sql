/*
  # Update project RLS policies

  1. Changes
    - Update project policies to allow projects with or without applications
    - Ensure users can only access their own projects
    - Allow users to create projects with optional application_id

  2. Security
    - Maintain user isolation
    - Verify application ownership when application_id is provided
*/

-- Drop existing project policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

-- Create new policies that handle both standalone and application-linked projects
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() AND (
      application_id IS NULL OR
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = projects.application_id
        AND applications.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      application_id IS NULL OR
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = application_id
        AND applications.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND (
      application_id IS NULL OR
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = projects.application_id
        AND applications.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() AND (
      application_id IS NULL OR
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = projects.application_id
        AND applications.user_id = auth.uid()
      )
    )
  );