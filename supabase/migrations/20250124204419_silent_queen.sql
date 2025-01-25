/*
  # Tech Info Blocks Structure

  1. New Tables
    - `tech_info_blocks` - Main info block table
    - `tech_info_items` - Individual info items within a block

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tech info blocks table
CREATE TABLE IF NOT EXISTS tech_info_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  technology_id uuid REFERENCES technologies(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'library', 'package', 'framework', 'blog', 'social_media'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tech info items table
CREATE TABLE IF NOT EXISTS tech_info_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES tech_info_blocks(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'text', 'image', 'link'
  content text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tech_info_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_info_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view tech info blocks"
  ON tech_info_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can manage tech info blocks"
  ON tech_info_blocks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view tech info items"
  ON tech_info_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can manage tech info items"
  ON tech_info_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_tech_info_blocks_technology ON tech_info_blocks(technology_id);
CREATE INDEX idx_tech_info_items_block ON tech_info_items(block_id);
CREATE INDEX idx_tech_info_items_order ON tech_info_items(block_id, order_index);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tech_info_blocks_updated_at
  BEFORE UPDATE ON tech_info_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_info_items_updated_at
  BEFORE UPDATE ON tech_info_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();