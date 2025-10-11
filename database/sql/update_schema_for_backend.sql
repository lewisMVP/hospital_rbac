-- Add missing columns to match backend expectations

-- Add is_active column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add email column if needed
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Set existing users as active
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Add last_login column for audit
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
