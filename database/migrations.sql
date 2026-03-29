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
