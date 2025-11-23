-- Game Goals Table
-- Tracks which players scored goals in each game
-- This is optional - games can exist without goal details
-- Each row represents one goal by a player (multiple rows = multiple goals)

CREATE TABLE IF NOT EXISTS game_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES roster(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_goals_game_id ON game_goals(game_id);
CREATE INDEX IF NOT EXISTS idx_game_goals_player_id ON game_goals(player_id);
CREATE INDEX IF NOT EXISTS idx_game_goals_game_player ON game_goals(game_id, player_id);

