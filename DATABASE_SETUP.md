# Database Setup for Ansury X

## Supabase SQL Schema

Run this SQL in your Supabase SQL Editor to set up the complete database schema:

```sql
-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Africa/Nairobi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can only see and update their own profile" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create cycles table
CREATE TABLE cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on cycles
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

-- Create policy for cycles
CREATE POLICY "Users can only access their own cycles" ON cycles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create unique constraint for one active cycle per user
CREATE UNIQUE INDEX unique_active_cycle_per_user ON cycles (user_id, status) 
WHERE status = 'active';

-- Create habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policy for habits
CREATE POLICY "Users can only access habits from their cycles" ON habits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = habits.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = habits.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  );

-- Create habit_completions table
CREATE TABLE habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Enable RLS on habit_completions
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Create policy for habit_completions
CREATE POLICY "Users can only access completions from their cycles" ON habit_completions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = habit_completions.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = habit_completions.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  );

-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  prompt_id UUID,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cycle_id, date)
);

-- Enable RLS on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for journal_entries
CREATE POLICY "Users can only access journal entries from their cycles" ON journal_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = journal_entries.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = journal_entries.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  );

-- Create xp_events table
CREATE TABLE xp_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  source TEXT CHECK (source IN ('completion', 'streak_bonus', 'badge')) NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on xp_events
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;

-- Create policy for xp_events
CREATE POLICY "Users can only access XP events from their cycles" ON xp_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = xp_events.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cycles 
      WHERE cycles.id = xp_events.cycle_id 
      AND cycles.user_id = auth.uid()
    )
  );

-- Create badges table (system-wide)
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  criteria_json JSONB NOT NULL
);

-- Insert default badges
INSERT INTO badges (code, name, description, criteria_json) VALUES
  ('week_one_warrior', 'Week One Warrior', 'Complete 7 consecutive days', '{"consecutive_days": 7}'),
  ('halfway_hero', 'Halfway Hero', 'Reach day 20 of your challenge', '{"day_reached": 20}'),
  ('marathon_mindset', 'Marathon Mindset', 'Reach day 30 of your challenge', '{"day_reached": 30}'),
  ('challenge_complete', 'Challenge Complete', 'Complete a full 40-day cycle', '{"day_reached": 40}'),
  ('perfect_week', 'Perfect Week', 'Complete 7 days in a row with 100% mission completion', '{"perfect_streak": 7}'),
  ('high_consistency', 'High Consistency', 'Achieve 90% or higher completion rate', '{"completion_rate": 90}'),
  ('streak_master', 'Streak Master', 'Achieve a 14-day streak', '{"consecutive_days": 14}');

-- Create user_badges table
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cycle_id UUID REFERENCES cycles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id, cycle_id)
);

-- Enable RLS on user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policy for user_badges
CREATE POLICY "Users can only access their own badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create settings table
CREATE TABLE settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT CHECK (theme IN ('light', 'dark', 'system')) DEFAULT 'dark',
  prompt_pack TEXT DEFAULT 'general',
  notifications JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policy for settings
CREATE POLICY "Users can only access their own settings" ON settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create prompts table
CREATE TABLE prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack TEXT NOT NULL,
  type TEXT CHECK (type IN ('morning', 'evening', 'general')) NOT NULL,
  text TEXT NOT NULL
);

-- Insert default prompts
INSERT INTO prompts (pack, type, text) VALUES
  ('general', 'morning', 'What is your top priority today? How will you show up? What is one potential obstacle and your plan to overcome it?'),
  ('general', 'evening', 'What was your biggest win today? What challenged you? What will you improve tomorrow? Name 3 things you are grateful for.'),
  ('general', 'general', 'What excuses have you overcome since starting this challenge?'),
  ('general', 'general', 'How is your energy and mood trending? What patterns do you notice?'),
  ('general', 'general', 'Which habit has had the biggest positive impact on your life so far?'),
  ('general', 'general', 'What has changed in you since Day 1? Which habit will you carry forward? What advice would you give your past self?');

-- Create indexes for better performance
CREATE INDEX idx_cycles_user_id ON cycles(user_id);
CREATE INDEX idx_cycles_status ON cycles(status);
CREATE INDEX idx_habits_cycle_id ON habits(cycle_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(date);
CREATE INDEX idx_habit_completions_cycle_id ON habit_completions(cycle_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_xp_events_cycle_id ON xp_events(cycle_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Challenger'));
  
  INSERT INTO settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for journal_entries updated_at
CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Implemented

- ✅ User authentication with email verification
- ✅ Profile management with timezone support
- ✅ 40-day cycle management
- ✅ Habit tracking (2-5 habits per cycle)
- ✅ Daily completion tracking
- ✅ XP and leveling system
- ✅ Badge achievements
- ✅ Journal entries with mood tracking
- ✅ Settings management
- ✅ Row Level Security (RLS) for privacy
- ✅ Automatic user profile creation on signup