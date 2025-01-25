/*
  # Add Tech Feed and Resources Schema

  1. New Tables
    - `resources`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `type` (text) - 'library' | 'tool' | 'framework'
      - `website_url` (text)
      - `documentation_url` (text)
      - `github_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `resource_technologies`
      - `resource_id` (uuid, references resources)
      - `technology_id` (uuid, references technologies)
    
    - `resource_projects`
      - `resource_id` (uuid, references resources)
      - `project_id` (uuid, references projects)
    
    - `tech_feed_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `type` (text) - 'article' | 'tutorial' | 'news' | 'resource'
      - `resource_id` (uuid, references resources, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tech_feed_post_technologies`
      - `post_id` (uuid, references tech_feed_posts)
      - `technology_id` (uuid, references technologies)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('library', 'tool', 'framework')),
  website_url text,
  documentation_url text,
  github_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create resource_technologies junction table
CREATE TABLE IF NOT EXISTS resource_technologies (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  technology_id uuid REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, technology_id)
);

-- Create resource_projects junction table
CREATE TABLE IF NOT EXISTS resource_projects (
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, project_id)
);

-- Create tech_feed_posts table
CREATE TABLE IF NOT EXISTS tech_feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('article', 'tutorial', 'news', 'resource')),
  resource_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tech_feed_post_technologies junction table
CREATE TABLE IF NOT EXISTS tech_feed_post_technologies (
  post_id uuid REFERENCES tech_feed_posts(id) ON DELETE CASCADE,
  technology_id uuid REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, technology_id)
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_feed_post_technologies ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (true);

-- Resource technologies policies
CREATE POLICY "Anyone can view resource technologies"
  ON resource_technologies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can manage resource technologies"
  ON resource_technologies FOR ALL
  TO authenticated
  USING (true);

-- Resource projects policies
CREATE POLICY "Users can view resource projects"
  ON resource_projects FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = resource_projects.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage resource projects"
  ON resource_projects FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = resource_projects.project_id
    AND projects.user_id = auth.uid()
  ));

-- Tech feed posts policies
CREATE POLICY "Anyone can view tech feed posts"
  ON tech_feed_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON tech_feed_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own posts"
  ON tech_feed_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own posts"
  ON tech_feed_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Tech feed post technologies policies
CREATE POLICY "Anyone can view post technologies"
  ON tech_feed_post_technologies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their post technologies"
  ON tech_feed_post_technologies FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tech_feed_posts
    WHERE tech_feed_posts.id = tech_feed_post_technologies.post_id
    AND tech_feed_posts.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_tech_feed_posts_type ON tech_feed_posts(type);
CREATE INDEX idx_tech_feed_posts_created ON tech_feed_posts(created_at DESC);
CREATE INDEX idx_tech_feed_posts_user ON tech_feed_posts(user_id);
CREATE INDEX idx_tech_feed_posts_resource ON tech_feed_posts(resource_id);

-- Update trigger for resources
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for tech_feed_posts
CREATE TRIGGER update_tech_feed_posts_updated_at
  BEFORE UPDATE ON tech_feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();