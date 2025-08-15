-- Manual user creation without relying on triggers
-- Run this in your Supabase SQL Editor after trying to create the user

-- First, check if there are any users without profiles
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE WHEN p.user_id IS NULL THEN 'Missing Profile' ELSE 'Has Profile' END as profile_status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- Create profiles for any users that are missing them
INSERT INTO user_profiles (
    user_id,
    onboarding_completed,
    currency,
    time_format,
    work_week,
    monthly_email,
    weekly_email,
    reminders
)
SELECT 
    u.id,
    false,
    'gbp',
    '24h',
    'mon-fri',
    true,
    true,
    true
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Verify all users now have profiles
SELECT 
    u.email,
    p.onboarding_completed,
    p.currency
FROM auth.users u
JOIN user_profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;
