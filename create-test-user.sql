-- Quick test user creation script
-- Use this in your Supabase Dashboard > Authentication > Users
-- Click "Add user" and use these credentials:

-- Email: test@example.com
-- Password: TestPassword123!
-- Auto Confirm User: YES (enable this checkbox)

-- After creating the user manually, you can test login immediately
-- The database trigger should automatically create the user profile

-- If the profile isn't created automatically, run this:
-- (Replace the UUID with the actual user ID from the auth.users table)

INSERT INTO user_profiles (user_id, onboarding_completed)
SELECT id, false
FROM auth.users 
WHERE email = 'test@example.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.users.id
);
