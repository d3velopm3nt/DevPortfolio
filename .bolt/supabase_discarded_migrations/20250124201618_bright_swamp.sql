/*
  # Tech Stack Database Structure

  1. New Tables
    - `tech_stack_categories` - Categories like Web, Mobile, etc.
    - `tech_stack_components` - Core components like Programming Language, Technology, Version
    - `tech_stack_modules` - Modules, Features, and Functionality
    - `tech_stack_organization` - Development Phase and Software Layer info
    - `tech_stack_tools` - Libraries, Packages, Frameworks, Repositories
    - `tech_stack_support` - Templates and Examples
    - `tech_stack_content` - Social Media, Website, and WebPage content

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tech stack categories table
CREATE TABLE IF NOT EXISTS tech_stack_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tech stack components table
CREATE TABLE IF NOT EXISTS tech_stack_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES tech_stack_categories(id),
  name text NOT NULL,
  type text NOT NULL, -- 'language', 'technology', 'version'
  parent_id uuid REFERENCES tech_stack_components(id), -- For hierarchical relationships
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tech stack modules table
CREATE TABLE IF NOT EXISTS tech_stack_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES tech_stack_components(id),
  type text NOT NULL, -- 'module', 'feature', 'functionality'
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tech stack organization table
CREATE TABLE IF NOT EXISTS tech_stack_organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES tech_stack_components(id),
  development_phase text,
  software_layer text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tech stack tools table
CREATE TABLE IF NOT EXISTS tech_stack_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES tech_stack_components(id),
  type text NOT NULL, -- 'library', 'package', 'framework', 'repository'
  name text NOT NULL,
  version text,
  description text,
  repository_url text,
  documentation_url text,
  created_at timestamptz DEFAULT now()
);

-- Create tech stack support table
CREATE TABLE IF NOT EXISTS tech_stack_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES tech_stack_components(id),
  type text NOT NULL, -- 'template', 'example'
  name text NOT NULL,
  content text,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Create tech stack content table
CREATE TABLE IF NOT EXISTS tech_stack_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES tech_stack_components(id),
  type text NOT NULL, -- 'social_media', 'website', 'webpage'
  title text NOT NULL,
  content text,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tech_stack_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stack_content ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view tech stack categories"
  ON tech_stack_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tech stack components"
  ON tech_stack_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tech stack modules"
  ON tech_stack_modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tech stack organization"
  ON tech_stack_organization FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tech stack tools"
  ON tech_stack_tools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tech stack support"
  ON tech_stack_support FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view tech stack content"
  ON tech_stack_content FOR SELECT
  TO authenticated
  USING (true);

-- Insert some initial categories
INSERT INTO tech_stack_categories (name, description) VALUES
  ('Web Development', 'Full stack web development technologies'),
  ('Mobile Development', 'Mobile app development technologies'),
  ('Desktop Development', 'Desktop application development technologies'),
  ('Cloud Computing', 'Cloud infrastructure and services'),
  ('DevOps', 'Development operations and automation')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_category ON tech_stack_components(category_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_components_parent ON tech_stack_components(parent_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_modules_component ON tech_stack_modules(component_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_organization_component ON tech_stack_organization(component_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_tools_component ON tech_stack_tools(component_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_support_component ON tech_stack_support(component_id);
CREATE INDEX IF NOT EXISTS idx_tech_stack_content_component ON tech_stack_content(component_id);