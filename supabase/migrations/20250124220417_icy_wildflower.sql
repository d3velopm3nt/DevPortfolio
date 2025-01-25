-- Create tech feed post info blocks table
CREATE TABLE IF NOT EXISTS tech_feed_post_info_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES tech_feed_posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('code', 'image', 'link', 'text', 'resource')),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tech feed post info items table
CREATE TABLE IF NOT EXISTS tech_feed_post_info_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id uuid REFERENCES tech_feed_post_info_blocks(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('text', 'image', 'link', 'code')),
  content text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tech_feed_post_info_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_feed_post_info_items ENABLE ROW LEVEL SECURITY;

-- Create policies for info blocks
CREATE POLICY "Anyone can view post info blocks"
  ON tech_feed_post_info_blocks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their post info blocks"
  ON tech_feed_post_info_blocks FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tech_feed_posts
    WHERE tech_feed_posts.id = tech_feed_post_info_blocks.post_id
    AND tech_feed_posts.user_id = auth.uid()
  ));

-- Create policies for info items
CREATE POLICY "Anyone can view post info items"
  ON tech_feed_post_info_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their post info items"
  ON tech_feed_post_info_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tech_feed_post_info_blocks
    JOIN tech_feed_posts ON tech_feed_post_info_blocks.post_id = tech_feed_posts.id
    WHERE tech_feed_post_info_blocks.id = tech_feed_post_info_items.block_id
    AND tech_feed_posts.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_post_info_blocks_post ON tech_feed_post_info_blocks(post_id);
CREATE INDEX idx_post_info_blocks_order ON tech_feed_post_info_blocks(post_id, order_index);
CREATE INDEX idx_post_info_items_block ON tech_feed_post_info_items(block_id);
CREATE INDEX idx_post_info_items_order ON tech_feed_post_info_items(block_id, order_index);

-- Update triggers
CREATE TRIGGER update_tech_feed_post_info_blocks_updated_at
  BEFORE UPDATE ON tech_feed_post_info_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_feed_post_info_items_updated_at
  BEFORE UPDATE ON tech_feed_post_info_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();