/*
  # Add Platform and OS Configuration

  1. New Tables
    - `platforms` - Stores available platforms (mobile, desktop, web, etc.)
    - `operating_systems` - Stores OS options for each platform
    - `project_platforms` - Links projects to platforms and their OS choices
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

-- Create operating systems table
CREATE TABLE IF NOT EXISTS operating_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid REFERENCES platforms(id) ON DELETE CASCADE,
  name text NOT NULL,
  version text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(platform_id, name, version)
);

-- Create project platforms junction table
CREATE TABLE IF NOT EXISTS project_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  platform_id uuid REFERENCES platforms(id) ON DELETE CASCADE,
  operating_system_id uuid REFERENCES operating_systems(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, platform_id, operating_system_id)
);

-- Enable RLS
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_platforms ENABLE ROW LEVEL SECURITY;

-- Platforms policies
CREATE POLICY "Anyone can view platforms"
  ON platforms FOR SELECT
  TO authenticated
  USING (true);

-- Operating systems policies
CREATE POLICY "Anyone can view operating systems"
  ON operating_systems FOR SELECT
  TO authenticated
  USING (true);

-- Project platforms policies
CREATE POLICY "Users can view their project platforms"
  ON project_platforms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_platforms.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their project platforms"
  ON project_platforms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_platforms.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_platforms.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Insert initial platforms
INSERT INTO platforms (name, description) VALUES
  ('Web', 'Web-based applications accessible through browsers'),
  ('Mobile', 'Applications for smartphones and tablets'),
  ('Desktop', 'Applications for desktop computers'),
  ('Watch', 'Applications for smartwatches and wearables'),
  ('TV', 'Applications for smart TVs and streaming devices'),
  ('IoT', 'Applications for Internet of Things devices')
ON CONFLICT (name) DO NOTHING;

-- Insert operating systems
DO $$
DECLARE
  v_web_id uuid;
  v_mobile_id uuid;
  v_desktop_id uuid;
  v_watch_id uuid;
  v_tv_id uuid;
  v_iot_id uuid;
BEGIN
  -- Get platform IDs
  SELECT id INTO v_web_id FROM platforms WHERE name = 'Web';
  SELECT id INTO v_mobile_id FROM platforms WHERE name = 'Mobile';
  SELECT id INTO v_desktop_id FROM platforms WHERE name = 'Desktop';
  SELECT id INTO v_watch_id FROM platforms WHERE name = 'Watch';
  SELECT id INTO v_tv_id FROM platforms WHERE name = 'TV';
  SELECT id INTO v_iot_id FROM platforms WHERE name = 'IoT';

  -- Web browsers
  INSERT INTO operating_systems (platform_id, name, version) VALUES
    (v_web_id, 'Chrome', 'Latest'),
    (v_web_id, 'Firefox', 'Latest'),
    (v_web_id, 'Safari', 'Latest'),
    (v_web_id, 'Edge', 'Latest');

  -- Mobile OS
  INSERT INTO operating_systems (platform_id, name, version) VALUES
    (v_mobile_id, 'iOS', 'iOS 15+'),
    (v_mobile_id, 'iOS', 'iOS 16+'),
    (v_mobile_id, 'iOS', 'iOS 17+'),
    (v_mobile_id, 'Android', 'Android 11+'),
    (v_mobile_id, 'Android', 'Android 12+'),
    (v_mobile_id, 'Android', 'Android 13+'),
    (v_mobile_id, 'Android', 'Android 14+');

  -- Desktop OS
  INSERT INTO operating_systems (platform_id, name, version) VALUES
    (v_desktop_id, 'Windows', 'Windows 10'),
    (v_desktop_id, 'Windows', 'Windows 11'),
    (v_desktop_id, 'macOS', 'Ventura'),
    (v_desktop_id, 'macOS', 'Sonoma'),
    (v_desktop_id, 'Linux', 'Ubuntu 22.04'),
    (v_desktop_id, 'Linux', 'Fedora 38');

  -- Watch OS
  INSERT INTO operating_systems (platform_id, name, version) VALUES
    (v_watch_id, 'watchOS', 'watchOS 9+'),
    (v_watch_id, 'watchOS', 'watchOS 10+'),
    (v_watch_id, 'Wear OS', 'Wear OS 3+'),
    (v_watch_id, 'Wear OS', 'Wear OS 4+');

  -- TV OS
  INSERT INTO operating_systems (platform_id, name, version) VALUES
    (v_tv_id, 'tvOS', 'tvOS 16+'),
    (v_tv_id, 'tvOS', 'tvOS 17+'),
    (v_tv_id, 'Android TV', 'Android TV 12+'),
    (v_tv_id, 'Android TV', 'Android TV 13+'),
    (v_tv_id, 'Tizen', 'Tizen 6.5+'),
    (v_tv_id, 'Roku OS', 'Roku OS 11+');

  -- IoT OS
  INSERT INTO operating_systems (platform_id, name, version) VALUES
    (v_iot_id, 'Raspberry Pi OS', 'Latest'),
    (v_iot_id, 'Arduino', 'Latest'),
    (v_iot_id, 'ESP32', 'Latest'),
    (v_iot_id, 'HomeKit', 'Latest');
END $$;