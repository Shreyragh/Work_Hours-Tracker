-- Database setup script for Work Hours Tracker
-- Run this in your Supabase SQL editor

-- Create custom types
DO $$ BEGIN
    CREATE TYPE organisation_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create organisations table
CREATE TABLE IF NOT EXISTS organisations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    default_wage DECIMAL,
    currency TEXT DEFAULT 'gbp',
    time_format TEXT DEFAULT '24h',
    work_week TEXT DEFAULT 'mon-fri',
    monthly_email BOOLEAN DEFAULT true,
    weekly_email BOOLEAN DEFAULT true,
    reminders BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    calendar_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organisation_members table
CREATE TABLE IF NOT EXISTS organisation_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role organisation_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organisation_id, user_id)
);

-- Create organisation_invites table
CREATE TABLE IF NOT EXISTS organisation_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role organisation_role NOT NULL DEFAULT 'MEMBER',
    token UUID DEFAULT gen_random_uuid(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create work_logs table
CREATE TABLE IF NOT EXISTS work_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    date DATE,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    custom_rate DECIMAL,
    default_rate BOOLEAN DEFAULT true,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clock_sessions table
CREATE TABLE IF NOT EXISTS clock_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar views
CREATE OR REPLACE VIEW calendar_tokens AS
SELECT 
    up.user_id,
    up.calendar_token
FROM user_profiles up;

CREATE OR REPLACE VIEW calendar_work_logs AS
SELECT 
    wl.id,
    wl.user_id,
    wl.date,
    wl.start_time,
    wl.end_time,
    wl.notes,
    wl.created_at,
    wl.updated_at
FROM work_logs wl
WHERE wl.date IS NOT NULL 
  AND wl.start_time IS NOT NULL 
  AND wl.end_time IS NOT NULL;

-- Create function to get users by IDs
CREATE OR REPLACE FUNCTION get_users_by_ids(user_ids UUID[])
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', u.id,
            'email', u.email,
            'created_at', u.created_at,
            'user_metadata', u.user_metadata
        )
    )
    INTO result
    FROM auth.users u
    WHERE u.id = ANY(user_ids);
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables
DROP TRIGGER IF EXISTS update_organisations_updated_at ON organisations;
CREATE TRIGGER update_organisations_updated_at
    BEFORE UPDATE ON organisations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organisation_members_updated_at ON organisation_members;
CREATE TRIGGER update_organisation_members_updated_at
    BEFORE UPDATE ON organisation_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_logs_updated_at ON work_logs;
CREATE TRIGGER update_work_logs_updated_at
    BEFORE UPDATE ON work_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clock_sessions_updated_at ON clock_sessions;
CREATE TRIGGER update_clock_sessions_updated_at
    BEFORE UPDATE ON clock_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE clock_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (with IF NOT EXISTS equivalent)

-- User profiles: Users can only see and edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Work logs: Users can only see and edit their own work logs
DROP POLICY IF EXISTS "Users can view own work logs" ON work_logs;
CREATE POLICY "Users can view own work logs" ON work_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own work logs" ON work_logs;
CREATE POLICY "Users can insert own work logs" ON work_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own work logs" ON work_logs;
CREATE POLICY "Users can update own work logs" ON work_logs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own work logs" ON work_logs;
CREATE POLICY "Users can delete own work logs" ON work_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Clock sessions: Users can only see and edit their own clock sessions
DROP POLICY IF EXISTS "Users can view own clock sessions" ON clock_sessions;
CREATE POLICY "Users can view own clock sessions" ON clock_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clock sessions" ON clock_sessions;
CREATE POLICY "Users can insert own clock sessions" ON clock_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clock sessions" ON clock_sessions;
CREATE POLICY "Users can update own clock sessions" ON clock_sessions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clock sessions" ON clock_sessions;
CREATE POLICY "Users can delete own clock sessions" ON clock_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Organisations: Basic read access for members
DROP POLICY IF EXISTS "Members can view their organisations" ON organisations;
CREATE POLICY "Members can view their organisations" ON organisations
    FOR SELECT USING (
        id IN (
            SELECT organisation_id 
            FROM organisation_members 
            WHERE user_id = auth.uid()
        )
    );

-- Organisation members: Members can view other members in their organisations
DROP POLICY IF EXISTS "Members can view organisation members" ON organisation_members;
CREATE POLICY "Members can view organisation members" ON organisation_members
    FOR SELECT USING (
        organisation_id IN (
            SELECT organisation_id 
            FROM organisation_members 
            WHERE user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
