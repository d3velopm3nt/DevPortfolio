/*
  # Add GitHub Integration

  1. Profile Updates
    - Add GitHub-specific fields to profiles table
  2. GitHub Repositories
    - Create table for storing GitHub repositories
    - Add policies for secure access
  3. Repository Sync
    - Add last sync timestamp for tracking updates
*/

-- Add GitHub fields to profiles
ALTER TABLE profiles
ADD COLUMN github_username text,
ADD COLUMN github_access_token text,
ADD COLUMN github_refresh_token text,
ADD COLUMN github_token_expires_at timestamptz,
ADD COLUMN github_last_sync_at timestamptz;

-- Create GitHub repositories table
CREATE TABLE github_repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  github_id bigint NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  description text,
  html_url text NOT NULL,
  language text,
  stargazers_count integer DEFAULT 0,
  forks_count integer DEFAULT 0,
  topics text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now(),
  UNIQUE(user_id, github_id)
);

-- Enable RLS
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;

-- Create policies for GitHub repositories
CREATE POLICY "Users can view their own GitHub repositories"
  ON github_repositories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their GitHub repositories"
  ON github_repositories
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_github_repositories_user ON github_repositories(user_id);
CREATE INDEX idx_github_repositories_language ON github_repositories(language);
CREATE INDEX idx_github_repositories_synced ON github_repositories(synced_at);

-- Update trigger for github_repositories
CREATE TRIGGER update_github_repositories_updated_at
  BEFORE UPDATE ON github_repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();