-- Make jersey_number optional in roster table
-- This migration alters the existing table if it was created with NOT NULL constraint

-- Alter the jersey_number column to allow NULL values
ALTER TABLE roster 
  ALTER COLUMN jersey_number DROP NOT NULL;

-- Note: The UNIQUE constraint (team_id, jersey_number) will still work
-- as NULL values are considered distinct in PostgreSQL

