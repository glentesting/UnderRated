-- UNDERRATED Database Schema
-- Run these statements in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- Each CREATE TABLE uses IF NOT EXISTS so it's safe to re-run.

-- 1. Diagnostic codes from 38 CFR Part 4
CREATE TABLE IF NOT EXISTS diagnostic_codes (
  code text PRIMARY KEY,
  condition_name text NOT NULL,
  body_system text,
  rating_0_criteria text,
  rating_10_criteria text,
  rating_20_criteria text,
  rating_30_criteria text,
  rating_40_criteria text,
  rating_50_criteria text,
  rating_60_criteria text,
  rating_70_criteria text,
  rating_80_criteria text,
  rating_90_criteria text,
  rating_100_criteria text,
  notes text,
  cfr_citation text
);

-- 2. Secondary service connection relationships
CREATE TABLE IF NOT EXISTS secondary_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_condition text NOT NULL,
  secondary_condition text NOT NULL,
  relationship_strength text CHECK (relationship_strength IN ('strong','moderate','possible')),
  medical_rationale text,
  cfr_or_precedent text
);

-- 3. MOS risk profiles — conditions common to specific military jobs
CREATE TABLE IF NOT EXISTS mos_risk_profiles (
  mos_code text PRIMARY KEY,
  mos_title text NOT NULL,
  branch text NOT NULL,
  high_risk_conditions text[],
  exposure_types text[],
  common_claims text[],
  notes text
);

-- 4. DBQ (Disability Benefits Questionnaire) criteria
CREATE TABLE IF NOT EXISTS dbq_criteria (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  condition_name text NOT NULL,
  dbq_form_number text,
  key_symptoms text[],
  exam_tips text,
  common_mistakes text
);

-- 5. VA knowledge chunks — indexed text for AI retrieval
CREATE TABLE IF NOT EXISTS va_knowledge_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source text,
  source_citation text,
  content text NOT NULL,
  condition_tags text[],
  chunk_type text
);

-- Enable Row Level Security (optional — service role bypasses RLS)
ALTER TABLE diagnostic_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mos_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbq_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE va_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY IF NOT EXISTS "Allow read diagnostic_codes" ON diagnostic_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow read secondary_connections" ON secondary_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow read mos_risk_profiles" ON mos_risk_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow read dbq_criteria" ON dbq_criteria FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow read va_knowledge_chunks" ON va_knowledge_chunks FOR SELECT TO authenticated USING (true);
