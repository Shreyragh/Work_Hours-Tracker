-- Temporary script to disable email confirmation for testing
-- This allows you to create accounts without email verification
-- You can re-enable this later in your Supabase dashboard

-- Check current auth settings
SELECT * FROM auth.config;

-- Note: You need to disable email confirmation in the Supabase Dashboard
-- Go to: Authentication > Settings > Email Auth
-- Turn OFF "Enable email confirmations"
