/*
  # Add Tech Stacks Support
  
  1. New Tables
    - `tech_stacks` - Predefined technology combinations (e.g., MEAN, MERN)
    - `tech_stack_technologies` - Junction table linking stacks to technologies
    - `project_tech_stacks` - Junction table linking projects to tech stacks
  
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create tech stacks table
CREATE TABLE IF NOT EXISTS tech_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  category text NOT NULL, -- e.g., 'Web', 'Mobile', 'Desktop'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tech stack technologies junction table
CREATE TABLE IF NOT EXISTS tech_stack_technologies (
  tech_stack_id uuid REFERENCES tech_stacks(id) ON DELETE CASCADE,
  technology_id uuid REFERENCES technologies(id) ON DELETE CASCADE,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (tech_stack_id, technology_id)
);

-- Create project tech stacks junction table
CREATE TABLE IF NOT EXISTS project_tech_stacks (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  tech_stack_id uuid REFERENCES tech_stacks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, tech_stack_id)
);

-- Enable RLS
ALTER TABLE tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tech_stacks ENABLE ROW LEVEL SECURITY;

-- Tech stacks policies
CREATE POLICY "Anyone can view tech stacks"
  ON tech_stacks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create tech stacks"
  ON tech_stacks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update tech stacks"
  ON tech_stacks FOR UPDATE
  TO authenticated
  USING (true);

-- Tech stack technologies policies
CREATE POLICY "Anyone can view tech stack technologies"
  ON tech_stack_technologies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can manage tech stack technologies"
  ON tech_stack_technologies FOR ALL
  TO authenticated
  USING (true);

-- Project tech stacks policies
CREATE POLICY "Users can view their project tech stacks"
  ON project_tech_stacks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stacks.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their project tech stacks"
  ON project_tech_stacks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stacks.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Insert some common tech stacks
INSERT INTO tech_stacks (name, description, category) VALUES
  ('MEAN', 'MongoDB, Express.js, Angular, Node.js stack for full-stack web development', 'Web'),
  ('MERN', 'MongoDB, Express.js, React, Node.js stack for full-stack web development', 'Web'),
  ('LAMP', 'Linux, Apache, MySQL, PHP classic web development stack', 'Web'),
  ('JAMstack', 'JavaScript, APIs, and Markup for modern web development', 'Web'),
  ('Flutter', 'Flutter and Dart for cross-platform mobile development', 'Mobile'),
  ('React Native', 'React Native and JavaScript for cross-platform mobile development', 'Mobile'),
  ('Electron', 'Electron and web technologies for cross-platform desktop apps', 'Desktop')
ON CONFLICT (name) DO NOTHING;