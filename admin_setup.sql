-- ============================================================
-- QuestBridge AI — Admin & Support Tickets Setup
-- ============================================================

-- 1. Update users role check to include 'admin'
-- First drop existing constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_name = 'users_role_check'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
END $$;

-- Re-add with 'admin'
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('host', 'attendee', 'admin'));

-- 2. Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    username    TEXT NOT NULL,
    email       TEXT NOT NULL,
    category    TEXT NOT NULL,
    subject     TEXT NOT NULL,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    reply       TEXT,
    replied_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status  ON support_tickets(status);

-- 3. Add default admin user if not exists 
-- Password: Admin@123 (hashed with bcrypt cost 12)
INSERT INTO users (email, password, role, username)
VALUES (
    'admin.qb.ai@gmail.com', 
    '$2b$12$GFQKgNEm/TTuiplbtC/PiOOJdtC4bJBdc9rEn8Xfwp7JsxzaRaLn.', 
    'admin', 
    'Super Admin'
)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', username = 'Super Admin';
