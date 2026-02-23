-- ============================================================
-- QuestBridge AI — Supabase Database Setup (Safe / Idempotent)
-- Run this entire script in:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to run multiple times — uses IF NOT EXISTS everywhere
-- ============================================================


-- ─── USERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    TEXT NOT NULL DEFAULT '',
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'attendee'
                  CHECK (role IN ('host', 'attendee')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add role column if table already exists without it
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'attendee';
-- Re-apply the check constraint (safe — won't error if already correct values)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('host', 'attendee'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;


-- ─── EVENTS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT NOT NULL,
    description      TEXT DEFAULT '',
    event_type       TEXT NOT NULL DEFAULT 'in_person',
    status           TEXT NOT NULL DEFAULT 'draft',
    start_date       TIMESTAMPTZ,
    end_date         TIMESTAMPTZ,
    location         TEXT DEFAULT '',
    virtual_link     TEXT DEFAULT '',
    max_attendees    INTEGER DEFAULT 100,
    cover_image      TEXT DEFAULT '',
    category         TEXT DEFAULT 'conference',
    ticket_price     NUMERIC DEFAULT 0,
    is_free          BOOLEAN DEFAULT TRUE,
    host_id          UUID,
    host_name        TEXT DEFAULT '',
    host_email       TEXT DEFAULT '',
    zoom_meeting_url TEXT DEFAULT '',
    zoom_meeting_id  TEXT DEFAULT '',
    zoom_password    TEXT DEFAULT '',
    is_started       BOOLEAN DEFAULT FALSE,
    advisor_name     TEXT DEFAULT '',
    contact          TEXT DEFAULT '',
    instruction      TEXT DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add new columns if the events table already existed
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_id          UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_name        TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_email       TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS zoom_meeting_url TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS zoom_meeting_id  TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS zoom_password    TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_started       BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS advisor_name     TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact          TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS instruction      TEXT DEFAULT '';

-- Add FK from host_id → users if not already set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'events' AND constraint_name = 'events_host_id_fkey'
  ) THEN
    ALTER TABLE events
      ADD CONSTRAINT events_host_id_fkey
      FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_events_status     ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_host_id    ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
ALTER TABLE events DISABLE ROW LEVEL SECURITY;


-- ─── JOIN REQUESTS TABLE (NEW) ────────────────────────────────
CREATE TABLE IF NOT EXISTS join_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name    TEXT NOT NULL DEFAULT '',
    user_email   TEXT NOT NULL DEFAULT '',
    message      TEXT DEFAULT '',
    status       TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
    ticket_type  TEXT NOT NULL DEFAULT 'general',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_requests_event_id ON join_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id  ON join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status   ON join_requests(status);
ALTER TABLE join_requests DISABLE ROW LEVEL SECURITY;


-- ─── PARTICIPANTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    organization TEXT NOT NULL DEFAULT '',
    phone        TEXT NOT NULL DEFAULT '',
    ticket_type  TEXT NOT NULL DEFAULT 'general',
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_participants_email  ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
ALTER TABLE participants DISABLE ROW LEVEL SECURITY;


-- ─── ENGAGEMENT LOGS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS engagement_logs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_email TEXT NOT NULL,
    activity_type     TEXT NOT NULL,
    details           TEXT,
    score             INTEGER NOT NULL DEFAULT 0,
    timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_engagement_email     ON engagement_logs(participant_email);
CREATE INDEX IF NOT EXISTS idx_engagement_timestamp ON engagement_logs(timestamp);
ALTER TABLE engagement_logs DISABLE ROW LEVEL SECURITY;


-- ─── VERIFY ───────────────────────────────────────────────────
SELECT
  table_name,
  (SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
   FROM information_schema.columns c
   WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
