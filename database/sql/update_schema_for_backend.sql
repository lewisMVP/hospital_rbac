-- Add missing columns to match backend expectations

-- ==================== USERS TABLE ====================
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

-- ==================== PATIENTS TABLE ====================
-- Add missing gender and email columns
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- ==================== APPOINTMENTS TABLE ====================
-- Add missing appointment_time and reason columns
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS appointment_time TIME,
ADD COLUMN IF NOT EXISTS reason TEXT;

-- Note: appointment_date is currently TIMESTAMP, backend expects DATE + TIME separated
-- If you need to split it, you'll need to migrate data:
-- UPDATE appointments SET appointment_time = appointment_date::TIME WHERE appointment_time IS NULL;
-- Then ALTER TABLE appointments ALTER COLUMN appointment_date TYPE DATE;

-- ==================== MEDICAL RECORDS TABLE ====================
-- Add missing diagnosis, treatment, prescription, notes columns
ALTER TABLE medicalrecords
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS treatment TEXT,
ADD COLUMN IF NOT EXISTS prescription TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migrate data from treatment_notes to diagnosis if treatment_notes exists
DO $$ 
BEGIN
    -- Check if treatment_notes column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medicalrecords' AND column_name = 'treatment_notes'
    ) THEN
        -- Copy data from treatment_notes to diagnosis
        UPDATE medicalrecords 
        SET diagnosis = treatment_notes 
        WHERE diagnosis IS NULL AND treatment_notes IS NOT NULL;
        
        -- Optionally drop treatment_notes column (uncomment if needed)
        -- ALTER TABLE medicalrecords DROP COLUMN treatment_notes;
    END IF;
END $$;

