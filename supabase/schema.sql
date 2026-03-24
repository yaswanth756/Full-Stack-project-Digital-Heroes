-- ═══════════════════════════════════════════════════════════
-- Golf Charity Subscription Platform — Full Database Schema
-- Supabase (PostgreSQL) · March 2026
-- ═══════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. USERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. SUBSCRIPTIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lapsed')),
  price DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date DATE NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- one active subscription per user
);

-- ─── 3. CHARITIES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL DEFAULT '',
  long_description TEXT DEFAULT '',
  image TEXT DEFAULT '🎗️',
  raised DECIMAL(10,2) DEFAULT 0,
  supporters INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. CHARITY EVENTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS charity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. USER CHARITY SELECTION ──────────────────────────
CREATE TABLE IF NOT EXISTS user_charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  percentage INTEGER NOT NULL DEFAULT 10 CHECK (percentage >= 10 AND percentage <= 50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- one charity selection per user
);

-- ─── 6. SCORES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient score queries (latest 5 per user)
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON scores(user_id, score_date DESC);

-- ─── 7. DRAWS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month TEXT NOT NULL,        -- e.g. "April 2026"
  draw_date DATE NOT NULL,
  drawn_numbers INTEGER[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  draw_logic TEXT DEFAULT 'random' CHECK (draw_logic IN ('random', 'algorithmic')),
  prize_pool_five DECIMAL(10,2) DEFAULT 0,
  prize_pool_four DECIMAL(10,2) DEFAULT 0,
  prize_pool_three DECIMAL(10,2) DEFAULT 0,
  jackpot_rollover DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- ─── 8. WINNERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
  matched_numbers INTEGER[] DEFAULT '{}',
  prize DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  verified BOOLEAN DEFAULT false,
  proof_uploaded BOOLEAN DEFAULT false,
  proof_url TEXT,
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winners_draw ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user ON winners(user_id);

-- ─── 9. DONATIONS (independent, not tied to subscription) ──
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  donor_name TEXT,
  donor_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. NOTIFICATIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('draw', 'winner', 'subscription', 'charity', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- ─── 11. PLATFORM STATS (materialized / cached) ────────
CREATE TABLE IF NOT EXISTS platform_stats (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton
  total_users INTEGER DEFAULT 0,
  active_subscribers INTEGER DEFAULT 0,
  total_prize_pool DECIMAL(10,2) DEFAULT 0,
  total_charity_contributions DECIMAL(10,2) DEFAULT 0,
  monthly_revenue DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 12. NOTIFICATION PREFERENCES ──────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  draw_results BOOLEAN DEFAULT true,
  winner_alerts BOOLEAN DEFAULT true,
  subscription_updates BOOLEAN DEFAULT true,
  charity_updates BOOLEAN DEFAULT true
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Public read on charities, charity_events, draws
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Charities are public" ON charities FOR SELECT USING (true);
CREATE POLICY "Admins manage charities" ON charities FOR ALL USING (true); -- managed via API

ALTER TABLE charity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Charity events are public" ON charity_events FOR SELECT USING (true);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published draws are public" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage draws" ON draws FOR ALL USING (true);

ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stats are public" ON platform_stats FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════

-- Insert charities
INSERT INTO charities (id, name, category, description, long_description, image, raised, supporters, featured) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Youth Shelter Network', 'Homelessness', 
   'Providing safe spaces and support for young people facing homelessness across the UK.',
   'Youth Shelter Network has been at the forefront of tackling youth homelessness since 2015. We provide emergency accommodation, counselling services, life skills training, and job placement support to help young people aged 16-25 rebuild their lives. With shelters in 12 cities across the UK, we''ve helped over 4,000 young people find stable housing and employment.',
   '🏠', 12480, 342, true),
  ('c0000002-0000-0000-0000-000000000002', 'Green Future Trust', 'Environment',
   'Planting trees, restoring habitats, and educating communities about sustainable living.',
   'Green Future Trust is dedicated to environmental conservation through active reforestation, habitat restoration, and community education programmes. Since our founding in 2018, we''ve planted over 500,000 trees, restored 2,000 acres of natural habitat, and educated 50,000 students.',
   '🌱', 9210, 218, false),
  ('c0000003-0000-0000-0000-000000000003', 'Hope & Play Foundation', 'Children',
   'Bringing play, sport, and joy to children in underserved communities through organised events.',
   'Hope & Play Foundation believes every child deserves the chance to play. We organise sports days, provide equipment, and run after-school programmes in underserved communities across England, Scotland, and Wales.',
   '⛳', 15600, 467, true),
  ('c0000004-0000-0000-0000-000000000004', 'Mind Matters UK', 'Mental Health',
   'Offering free counselling, helplines, and peer-support groups for adults experiencing anxiety and depression.',
   'Mind Matters UK provides free and accessible mental health support to adults across the United Kingdom. Our services include 24/7 helplines, online counselling, peer-support groups, and workplace wellbeing programmes.',
   '💚', 8340, 195, false),
  ('c0000005-0000-0000-0000-000000000005', 'Golf for Good', 'Sport & Inclusion',
   'Making golf accessible to disabled and disadvantaged communities through free coaching and equipment loans.',
   'Golf for Good is on a mission to make golf truly inclusive. We provide free coaching, adaptive equipment, and sponsored memberships to disabled and disadvantaged individuals.',
   '🏌️', 6720, 134, true),
  ('c0000006-0000-0000-0000-000000000006', 'Ocean Guardians', 'Environment',
   'Protecting marine ecosystems through cleanup operations, research, and coastal conservation projects.',
   'Ocean Guardians works to protect our marine environment through coastal cleanup operations, marine research, and conservation advocacy.',
   '🌊', 4850, 98, false)
ON CONFLICT DO NOTHING;

-- Insert charity events
INSERT INTO charity_events (charity_id, title, event_date, location) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Charity Golf Day', '2026-05-15', 'St Andrews'),
  ('c0000001-0000-0000-0000-000000000001', 'Fundraising Gala', '2026-06-20', 'London'),
  ('c0000002-0000-0000-0000-000000000002', 'Tree Planting Day', '2026-04-22', 'Edinburgh'),
  ('c0000003-0000-0000-0000-000000000003', 'Junior Golf Tournament', '2026-07-10', 'Manchester'),
  ('c0000003-0000-0000-0000-000000000003', 'Sports Day Festival', '2026-08-05', 'Cardiff'),
  ('c0000004-0000-0000-0000-000000000004', 'Wellbeing Walk', '2026-05-30', 'Birmingham'),
  ('c0000005-0000-0000-0000-000000000005', 'Inclusive Golf Open', '2026-06-15', 'Glasgow'),
  ('c0000005-0000-0000-0000-000000000005', 'Equipment Drive', '2026-04-10', 'Bristol'),
  ('c0000006-0000-0000-0000-000000000006', 'Beach Cleanup Day', '2026-05-01', 'Cornwall')
ON CONFLICT DO NOTHING;

-- Insert platform stats singleton
INSERT INTO platform_stats (id, total_users, active_subscribers, total_prize_pool, total_charity_contributions, monthly_revenue)
VALUES (1, 0, 0, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_charities_updated_at BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_user_charities_updated_at BEFORE UPDATE ON user_charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: Enforce max 5 scores per user (rolling logic)
CREATE OR REPLACE FUNCTION enforce_max_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM scores
  WHERE id IN (
    SELECT id FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date DESC, created_at DESC
    OFFSET 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_5_scores
  AFTER INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_max_scores();

-- Function: Refresh platform stats
CREATE OR REPLACE FUNCTION refresh_platform_stats()
RETURNS void AS $$
BEGIN
  UPDATE platform_stats SET
    total_users = (SELECT COUNT(*) FROM users WHERE role = 'subscriber'),
    active_subscribers = (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
    total_prize_pool = COALESCE((SELECT SUM(prize) FROM winners WHERE payment_status = 'pending'), 0),
    total_charity_contributions = COALESCE((SELECT SUM(amount) FROM donations), 0) +
      COALESCE((SELECT SUM(s.price * uc.percentage / 100) FROM subscriptions s JOIN user_charities uc ON s.user_id = uc.user_id WHERE s.status = 'active'), 0),
    monthly_revenue = COALESCE((SELECT SUM(CASE WHEN plan = 'monthly' THEN price ELSE price/12 END) FROM subscriptions WHERE status = 'active'), 0),
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;
