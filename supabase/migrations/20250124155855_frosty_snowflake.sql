/*
  # Fix Profile RLS Policies

  1. Changes
    - Add policy for inserting new profiles
    - Update existing profile policies to be more permissive
    - Allow authenticated users to create their own profile

  2. Security
    - Maintain security by ensuring users can only manage their own data
    - Keep existing read/update policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can manage their own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;