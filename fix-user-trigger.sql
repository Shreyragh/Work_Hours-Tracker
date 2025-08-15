-- Fix the user profile creation trigger
-- Run this in your Supabase SQL Editor

-- First, let's drop the existing trigger and function to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust user profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new user profile with safer error handling
    INSERT INTO public.user_profiles (
        user_id,
        onboarding_completed,
        currency,
        time_format,
        work_week,
        monthly_email,
        weekly_email,
        reminders
    )
    VALUES (
        NEW.id,
        false,
        'gbp',
        '24h',
        'mon-fri',
        true,
        true,
        true
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Also let's make sure the user_profiles table has proper permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;

-- Grant usage on the sequence as well
GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO anon;
