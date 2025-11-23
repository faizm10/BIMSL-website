-- BIMSL Roster Table
-- Create table for team rosters with player statistics

-- Roster/Players table
CREATE TABLE IF NOT EXISTS roster (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  jersey_number INTEGER, -- Optional jersey number
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number) -- Ensure unique jersey number per team (NULL values are considered distinct)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roster_team_id ON roster(team_id);
CREATE INDEX IF NOT EXISTS idx_roster_goals ON roster(goals DESC);
CREATE INDEX IF NOT EXISTS idx_roster_assists ON roster(assists DESC);
CREATE INDEX IF NOT EXISTS idx_roster_jersey_number ON roster(jersey_number);

