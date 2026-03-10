-- Phase 1.1: New table for revoked tokens
CREATE TABLE IF NOT EXISTS revoked_tokens (
  jti TEXT PRIMARY KEY,
  revoked_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT -- Text to match users.id type
);

-- Phase 1.2: New table for activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  reference_id TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  device_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 1.3: Alter customers — add missing columns
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS assigned_sales_rep TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Phase 1.4: Alter orders — add missing columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sales_rep_id TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS synced BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Phase 1.5: Alter check_ins — replace base64 with URL
ALTER TABLE check_ins
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Phase 2.4: Enable Realtime for messages 
-- Note: 'supabase_realtime' publication usually exists, we add the table to it.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Publication doesn't exist, ignore or create it if needed
        NULL;
END
$$;

-- Phase 4.2: FCM Tokens table
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
