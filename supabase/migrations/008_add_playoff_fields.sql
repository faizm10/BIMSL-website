-- Add playoff fields to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS is_playoff BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Create index for playoff games
CREATE INDEX IF NOT EXISTS idx_games_is_playoff ON games(is_playoff);
CREATE INDEX IF NOT EXISTS idx_games_is_published ON games(is_published);

-- Update existing playoff games (those with match_id starting with 'PLAYOFF-')
UPDATE games
SET is_playoff = TRUE
WHERE match_id LIKE 'PLAYOFF-%';

