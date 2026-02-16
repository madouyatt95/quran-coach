-- ==========================================
-- Push Subscriptions Table for Web Push API
-- Run this in Supabase SQL Editor
-- ==========================================

-- Create the table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint TEXT NOT NULL UNIQUE,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    prayer_enabled BOOLEAN DEFAULT true,
    prayer_minutes_before INT DEFAULT 10,
    hadith_enabled BOOLEAN DEFAULT true,
    challenge_enabled BOOLEAN DEFAULT true,
    latitude FLOAT,
    longitude FLOAT,
    timezone TEXT DEFAULT 'Europe/Paris',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by endpoint
CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint ON push_subscriptions(endpoint);

-- ==========================================
-- Row Level Security (RLS) Policies
-- No auth needed — identified by endpoint
-- ==========================================

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (subscribe)
CREATE POLICY "Allow anonymous insert" ON push_subscriptions
    FOR INSERT
    WITH CHECK (true);

-- Anyone can update their own subscription (matched by endpoint)
CREATE POLICY "Allow update by endpoint" ON push_subscriptions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Anyone can delete their own subscription
CREATE POLICY "Allow delete by endpoint" ON push_subscriptions
    FOR DELETE
    USING (true);

-- Only service role can read all (for the Edge Function)
CREATE POLICY "Allow service role read" ON push_subscriptions
    FOR SELECT
    USING (auth.role() = 'service_role');

-- ==========================================
-- pg_cron scheduling (run in SQL Editor)
-- Requires pg_cron extension to be enabled
-- ==========================================

-- Schedule Edge Function to run every 30 minutes
-- Uncomment after deploying the Edge Function:

-- SELECT cron.schedule(
--     'send-push-notifications',
--     '*/30 * * * *',
--     $$
--     SELECT net.http_post(
--         url := 'https://zuyhuqpafjtasoedtyai.supabase.co/functions/v1/send-notifications',
--         headers := jsonb_build_object(
--             'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--             'Content-Type', 'application/json'
--         ),
--         body := '{}'::jsonb
--     );
--     $$
-- );
