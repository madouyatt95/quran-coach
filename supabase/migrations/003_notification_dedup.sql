-- Migration 003: Add deduplication columns for push notifications
-- These columns track the last time each notification type was sent per subscription.
-- The Edge Function checks these before sending to avoid duplicates when using a wide detection window.

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS last_notified_fajr       timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_dhuhr      timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_asr        timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_maghrib    timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_isha       timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_hadith     timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_challenge  timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_daruri_sobh timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_daruri_asr  timestamptz,
  ADD COLUMN IF NOT EXISTS last_notified_akhir_isha  timestamptz;
