/*
  # Fix Update Project Function

  1. Changes
    - Add proper security context
    - Expose function to the REST API
    - Add proper RLS checks
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_project;

-- Recreate the function with proper security and REST exposure
CREATE OR REPLACE FUNCTION update_project(
  p_project_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_github_url TEXT,
  p_live_url TEXT,
  p_tech_names TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the user ID from the current session
  v_user_id := auth.uid();
  
  -- Check if the project belongs to the current user
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = p_project_id 
    AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update project details
  UPDATE projects
  SET
    title = p_title,
    description = p_description,
    github_url = p_github_url,
    live_url = p_live_url,
    updated_at = NOW()
  WHERE id = p_project_id
  AND user_id = v_user_id;

  -- Delete existing technology associations
  DELETE FROM project_technologies
  WHERE project_id = p_project_id;

  -- Insert new technology associations
  INSERT INTO project_technologies (project_id, technology_id)
  SELECT p_project_id, t.id
  FROM technologies t
  WHERE t.name = ANY(p_tech_names);

  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_project TO authenticated;

-- Add comment for REST API documentation
COMMENT ON FUNCTION update_project IS 'Updates a project and its technology associations';