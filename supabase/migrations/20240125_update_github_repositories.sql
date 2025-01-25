-- Add project_id to github_repositories table
ALTER TABLE github_repositories 
ADD COLUMN project_id UUID REFERENCES projects(id),
ADD COLUMN readme_content TEXT,
ADD COLUMN dependencies JSONB DEFAULT '{}'::jsonb,
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better query performance
CREATE INDEX idx_github_repositories_project_id ON github_repositories(project_id);
CREATE INDEX idx_github_repositories_user_id ON github_repositories(user_id);

-- Add comment to explain columns
COMMENT ON COLUMN github_repositories.project_id IS 'Reference to the project this repository is linked to';
COMMENT ON COLUMN github_repositories.readme_content IS 'Cached README content from GitHub';
COMMENT ON COLUMN github_repositories.dependencies IS 'Package dependencies extracted from package.json';
COMMENT ON COLUMN github_repositories.last_synced_at IS 'Timestamp of last successful sync with GitHub';

-- Add trigger to update last_synced_at
CREATE OR REPLACE FUNCTION update_github_repository_last_synced_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_synced_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER github_repository_sync_timestamp
    BEFORE UPDATE ON github_repositories
    FOR EACH ROW
    EXECUTE FUNCTION update_github_repository_last_synced_at(); 