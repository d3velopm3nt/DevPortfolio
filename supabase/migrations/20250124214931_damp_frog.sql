-- Create resource types table
CREATE TABLE IF NOT EXISTS resource_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_resource_types_updated_at
  BEFORE UPDATE ON resource_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view resource types"
  ON resource_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can manage resource types"
  ON resource_types FOR ALL
  TO authenticated
  USING (true);

-- Modify resources table to use resource_types
ALTER TABLE resources DROP CONSTRAINT resources_type_check;
ALTER TABLE resources ADD COLUMN type_id uuid REFERENCES resource_types(id);

-- Insert default resource types
INSERT INTO resource_types (name, description, icon_name) VALUES
  ('Library', 'Software libraries and packages that can be integrated into projects', 'library'),
  ('Tool', 'Development tools and utilities', 'tool'),
  ('Framework', 'Full-featured frameworks for building applications', 'code'),
  ('Plugin', 'Extensions and plugins for existing tools or frameworks', 'plug'),
  ('Service', 'Cloud services and APIs', 'cloud')
ON CONFLICT (name) DO NOTHING;