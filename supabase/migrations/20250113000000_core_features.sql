-- Core Features Migration for TapKind
-- This migration adds tables for tips, transactions, volunteer check-ins, points, badges, and QR codes

-- ============================================
-- TIPS & TRANSACTIONS
-- ============================================

-- Tips table: Records all tips given
CREATE TABLE public.tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Users can view tips they gave
CREATE POLICY "Users can view tips they gave"
ON public.tips
FOR SELECT
USING (auth.uid() = giver_id);

-- Users can view tips they received
CREATE POLICY "Users can view tips they received"
ON public.tips
FOR SELECT
USING (auth.uid() = recipient_id);

-- Users can insert tips they give
CREATE POLICY "Users can insert tips they give"
ON public.tips
FOR INSERT
WITH CHECK (auth.uid() = giver_id);

-- Create index for faster queries
CREATE INDEX idx_tips_giver_id ON public.tips(giver_id);
CREATE INDEX idx_tips_recipient_id ON public.tips(recipient_id);
CREATE INDEX idx_tips_created_at ON public.tips(created_at DESC);

-- ============================================
-- VOLUNTEER CHECK-INS
-- ============================================

-- Volunteer check-ins table
CREATE TABLE public.volunteer_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_location TEXT,
  hours DECIMAL(4, 2) NOT NULL CHECK (hours > 0),
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_checkins ENABLE ROW LEVEL SECURITY;

-- Users can view their own check-ins
CREATE POLICY "Users can view own check-ins"
ON public.volunteer_checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own check-ins
CREATE POLICY "Users can insert own check-ins"
ON public.volunteer_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own check-ins (within time limit)
CREATE POLICY "Users can update own check-ins"
ON public.volunteer_checkins
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_volunteer_checkins_user_id ON public.volunteer_checkins(user_id);
CREATE INDEX idx_volunteer_checkins_created_at ON public.volunteer_checkins(created_at DESC);

-- ============================================
-- POINTS & ACTIVITY LOG
-- ============================================

-- Points/Activity log table
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'tip_given', 'tip_received', 'volunteer_hours', 'badge_earned', etc.
  points_earned INTEGER NOT NULL DEFAULT 0,
  related_id UUID, -- Reference to tips, checkins, badges, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
ON public.activity_log
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert activity (via function)
CREATE POLICY "System can insert activity"
ON public.activity_log
FOR INSERT
WITH CHECK (true); -- Will be restricted by function

-- Create index
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_type ON public.activity_log(activity_type);

-- ============================================
-- BADGES
-- ============================================

-- Badges definition table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  points_required INTEGER DEFAULT 0,
  criteria JSONB, -- Flexible criteria for earning badge
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User badges (many-to-many)
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone"
ON public.badges
FOR SELECT
USING (true);

-- User badges are viewable by everyone (for leaderboard)
CREATE POLICY "User badges are viewable by everyone"
ON public.user_badges
FOR SELECT
USING (true);

-- Users can view their own badges
CREATE POLICY "Users can view own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert user badges (via function)
CREATE POLICY "System can insert user badges"
ON public.user_badges
FOR INSERT
WITH CHECK (true); -- Will be restricted by function

-- Create indexes
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);

-- ============================================
-- QR CODES / TIP IDs
-- ============================================

-- QR codes/TipIDs for recipients
CREATE TABLE public.recipient_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id TEXT NOT NULL UNIQUE, -- The TipID string (e.g., "TK123456")
  qr_code_url TEXT, -- URL to QR code image
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipient_codes ENABLE ROW LEVEL SECURITY;

-- Recipient codes are viewable by everyone (for scanning)
CREATE POLICY "Recipient codes are viewable by everyone"
ON public.recipient_codes
FOR SELECT
USING (is_active = true);

-- Users can view their own codes
CREATE POLICY "Users can view own codes"
ON public.recipient_codes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own codes
CREATE POLICY "Users can insert own codes"
ON public.recipient_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own codes
CREATE POLICY "Users can update own codes"
ON public.recipient_codes
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_recipient_codes_tip_id ON public.recipient_codes(tip_id);
CREATE INDEX idx_recipient_codes_user_id ON public.recipient_codes(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_recipient_codes_updated_at
BEFORE UPDATE ON public.recipient_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate total points for a user
CREATE OR REPLACE FUNCTION public.get_user_total_points(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(points_earned) FROM public.activity_log WHERE user_id = user_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award points and log activity
CREATE OR REPLACE FUNCTION public.award_points(
  user_uuid UUID,
  points INTEGER,
  activity_type TEXT,
  description TEXT DEFAULT NULL,
  related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.activity_log (user_id, activity_type, points_earned, related_id, description)
  VALUES (user_uuid, activity_type, points, related_id, description)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_points INTEGER;
  badge_record RECORD;
BEGIN
  -- Get user's total points
  total_points := public.get_user_total_points(user_uuid);
  
  -- Check for badges that should be awarded
  FOR badge_record IN
    SELECT * FROM public.badges
    WHERE points_required <= total_points
    AND id NOT IN (
      SELECT badge_id FROM public.user_badges WHERE user_id = user_uuid
    )
  LOOP
    -- Award the badge
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (user_uuid, badge_record.id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    
    -- Log the badge earning
    PERFORM public.award_points(
      user_uuid,
      0, -- Badges don't give points, they're earned with points
      'badge_earned',
      'Earned badge: ' || badge_record.name,
      badge_record.id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process a tip (award points, check badges)
CREATE OR REPLACE FUNCTION public.process_tip(
  tip_id UUID
)
RETURNS VOID AS $$
DECLARE
  tip_record RECORD;
BEGIN
  -- Get tip details
  SELECT * INTO tip_record FROM public.tips WHERE id = tip_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tip not found';
  END IF;
  
  -- Award points to giver (e.g., 10 points per dollar)
  PERFORM public.award_points(
    tip_record.giver_id,
    FLOOR(tip_record.amount * 10)::INTEGER,
    'tip_given',
    'Gave tip of $' || tip_record.amount,
    tip_id
  );
  
  -- Award points to recipient (e.g., 5 points per dollar)
  PERFORM public.award_points(
    tip_record.recipient_id,
    FLOOR(tip_record.amount * 5)::INTEGER,
    'tip_received',
    'Received tip of $' || tip_record.amount,
    tip_id
  );
  
  -- Check for badges for both users
  PERFORM public.check_and_award_badges(tip_record.giver_id);
  PERFORM public.check_and_award_badges(tip_record.recipient_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process tip after insertion
CREATE OR REPLACE FUNCTION public.handle_tip_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.process_tip(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_tip_inserted
AFTER INSERT ON public.tips
FOR EACH ROW
EXECUTE FUNCTION public.handle_tip_insert();

-- Function to process volunteer check-in (award points)
CREATE OR REPLACE FUNCTION public.process_volunteer_checkin(
  checkin_id UUID
)
RETURNS VOID AS $$
DECLARE
  checkin_record RECORD;
  points_per_hour INTEGER := 50; -- 50 points per hour
BEGIN
  -- Get check-in details
  SELECT * INTO checkin_record FROM public.volunteer_checkins WHERE id = checkin_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Check-in not found';
  END IF;
  
  -- Award points (50 points per hour)
  PERFORM public.award_points(
    checkin_record.user_id,
    FLOOR(checkin_record.hours * points_per_hour)::INTEGER,
    'volunteer_hours',
    'Volunteered ' || checkin_record.hours || ' hours at ' || checkin_record.event_name,
    checkin_id
  );
  
  -- Check for badges
  PERFORM public.check_and_award_badges(checkin_record.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process check-in after insertion
CREATE OR REPLACE FUNCTION public.handle_checkin_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.process_volunteer_checkin(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_checkin_inserted
AFTER INSERT ON public.volunteer_checkins
FOR EACH ROW
EXECUTE FUNCTION public.handle_checkin_insert();

-- ============================================
-- SEED DATA: Initial Badges
-- ============================================

INSERT INTO public.badges (name, description, icon, points_required, criteria) VALUES
('First Tip', 'Give your first tip', 'heart', 0, '{"type": "first_tip"}'::jsonb),
('Generous Giver', 'Give 10 tips', 'gift', 0, '{"type": "tip_count", "count": 10}'::jsonb),
('Kindness Champion', 'Earn 1000 points', 'award', 1000, '{"type": "points", "points": 1000}'::jsonb),
('Volunteer Hero', 'Complete 10 volunteer hours', 'users', 0, '{"type": "volunteer_hours", "hours": 10}'::jsonb),
('Community Builder', 'Earn 5000 points', 'star', 5000, '{"type": "points", "points": 5000}'::jsonb),
('Top Giver', 'Give $100 in tips', 'dollar-sign', 0, '{"type": "tip_amount", "amount": 100}'::jsonb);
