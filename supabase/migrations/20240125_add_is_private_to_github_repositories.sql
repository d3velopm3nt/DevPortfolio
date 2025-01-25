-- Add is_private column to github_repositories table
ALTER TABLE github_repositories 
ADD COLUMN is_private BOOLEAN DEFAULT false NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN github_repositories.is_private IS 'Indicates if the repository is private on GitHub'; 