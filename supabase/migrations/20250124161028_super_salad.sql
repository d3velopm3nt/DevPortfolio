/*
  # Add Update Project Function

  1. Changes
    - Add a function to handle project updates in a transaction
    - Safely update project details and technology associations
*/

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
AS $$
BEGIN
  -- Update project details
  UPDATE projects
  SET
    title = p_title,
    description = p_description,
    github_url = p_github_url,
    live_url = p_live_url,
    updated_at = NOW()
  WHERE id = p_project_id;

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