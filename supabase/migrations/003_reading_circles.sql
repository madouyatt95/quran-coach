-- ════════════════════════════════════════════════════════════
-- Supabase Migration: Reading Circles (Cercle de Lecture)
-- Run this SQL in the Supabase SQL Editor
-- ════════════════════════════════════════════════════════════

-- 1. Reading Circles table
CREATE TABLE IF NOT EXISTS reading_circles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '📖',
    goal TEXT NOT NULL DEFAULT 'Khatm en 30 jours',
    total_pages INTEGER NOT NULL DEFAULT 604,
    invite_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Circle Members table
CREATE TABLE IF NOT EXISTS circle_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID NOT NULL REFERENCES reading_circles(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🌙',
    pages_read INTEGER NOT NULL DEFAULT 0,
    last_activity TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(circle_id, device_id)
);

-- 3. Circle Activities table
CREATE TABLE IF NOT EXISTS circle_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID NOT NULL REFERENCES reading_circles(id) ON DELETE CASCADE,
    member_device_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pages', 'khatm', 'join', 'milestone')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_device ON circle_members(device_id);
CREATE INDEX IF NOT EXISTS idx_circle_activities_circle ON circle_activities(circle_id);
CREATE INDEX IF NOT EXISTS idx_reading_circles_invite ON reading_circles(invite_code);

-- Enable Row Level Security
ALTER TABLE reading_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_activities ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required, like the rest of the app)
CREATE POLICY "Allow all on reading_circles" ON reading_circles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on circle_members" ON circle_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on circle_activities" ON circle_activities FOR ALL USING (true) WITH CHECK (true);
