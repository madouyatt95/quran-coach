-- Add missing columns to push_subscriptions
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS prayer_minutes_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS daruri_sobh_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daruri_asr_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS akhir_isha_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prayer_settings JSONB DEFAULT '{}';

-- Note: User already configured cron to 5 min manually.
-- This migration ensures the table structure matches the app's expectations.
