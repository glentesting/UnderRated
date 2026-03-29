-- Migrations for UNDERRATED Supabase database
-- Run in Supabase SQL Editor

-- Add mos_title column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mos_title text;

-- Ensure all required profile columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS branch text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mos text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_rating integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS era text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_service integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dependents integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name text;

-- Uploads table for document vault
CREATE TABLE IF NOT EXISTS uploads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename text,
  file_url text,
  conditions_found integer,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own uploads" ON uploads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own uploads" ON uploads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
