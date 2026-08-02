-- ============================================
-- Smart Bharat - Supabase Schema
-- ============================================
-- Run this in the Supabase SQL Editor for project: rmzccicctawoexoiofnc
-- This creates the complaints table and all required infrastructure

-- 1. Create the complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'anonymous',
  tracking_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  department TEXT NOT NULL DEFAULT 'Municipal Corporation',
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_tracking_id ON complaints(tracking_id);

-- 3. Enable Row Level Security
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Allow public read and insert (civic platform)
CREATE POLICY "Allow public read" ON complaints
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON complaints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON complaints
  FOR UPDATE USING (true);

-- 5. Seed minimal demo data for hackathon demo
INSERT INTO complaints (id, user_id, tracking_id, title, description, category, department, status, priority, address, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'demo-citizen-1', 'COMP-100001', 'Pothole on National Highway', 'Large pothole causing accidents near the main intersection. Multiple vehicles have been damaged.', 'Roads', 'Public Works Department', 'SUBMITTED', 'HIGH', 'NH-44, Sector 12, Delhi', now() - interval '3 days', now() - interval '3 days'),
  (gen_random_uuid(), 'demo-citizen-2', 'COMP-100002', 'Garbage Dump Near School', 'Garbage has been accumulating near the government school for over a week. Children are falling sick.', 'Sanitation', 'Municipal Corporation', 'ACKNOWLEDGED', 'URGENT', 'Government School, Block C, Noida', now() - interval '5 days', now() - interval '2 days'),
  (gen_random_uuid(), 'demo-citizen-3', 'COMP-100003', 'Street Light Not Working', 'Three streetlights on the main road have not been working for 2 weeks. Area is very dark at night.', 'Electricity', 'Electricity Board', 'IN_PROGRESS', 'MEDIUM', 'Main Road, Sector 7, Gurugram', now() - interval '10 days', now() - interval '1 day'),
  (gen_random_uuid(), 'demo-citizen-4', 'COMP-100004', 'Water Pipeline Leak', 'Major water pipeline leak causing water wastage and road flooding in the residential area.', 'Water Supply', 'Water Board', 'RESOLVED', 'HIGH', 'Colony Road, Phase 2, Faridabad', now() - interval '14 days', now() - interval '2 days'),
  (gen_random_uuid(), 'demo-citizen-5', 'COMP-100005', 'Broken Park Bench', 'Public park bench is broken and has sharp edges. Children could get injured.', 'Public Property', 'Parks Department', 'SUBMITTED', 'LOW', 'Central Park, Sector 22, Chandigarh', now() - interval '1 day', now() - interval '1 day'),
  (gen_random_uuid(), 'demo-citizen-6', 'COMP-100006', 'Illegal Construction on Footpath', 'Unauthorized construction blocking the public footpath. Pedestrians forced to walk on the road.', 'Infrastructure', 'Municipal Corporation', 'SUBMITTED', 'HIGH', 'Market Area, MG Road, Bangalore', now() - interval '2 days', now() - interval '2 days'),
  (gen_random_uuid(), 'demo-citizen-7', 'COMP-100007', 'Drainage Overflow During Rain', 'Storm drains are blocked causing severe flooding during rainfall in the residential colony.', 'Sanitation', 'Municipal Corporation', 'IN_PROGRESS', 'URGENT', 'Green Colony, Sector 15, Pune', now() - interval '7 days', now() - interval '3 days'),
  (gen_random_uuid(), 'demo-citizen-8', 'COMP-100008', 'Dangerous Tree Branch Hanging Over Road', 'A large tree branch is hanging dangerously over the main road. Could fall on vehicles or pedestrians.', 'Environment', 'Forest Department', 'ACKNOWLEDGED', 'HIGH', 'Ring Road, Near Metro Station, Hyderabad', now() - interval '4 days', now() - interval '1 day')
ON CONFLICT (tracking_id) DO NOTHING;
