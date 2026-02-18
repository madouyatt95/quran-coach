-- Analytics Events table for anonymous user tracking
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  event TEXT NOT NULL,
  page TEXT,
  metadata JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_device ON analytics_events (device_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events (event);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events (created_at);

-- RLS: anyone can insert, only service_role can read
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read" ON analytics_events FOR SELECT USING (true);
