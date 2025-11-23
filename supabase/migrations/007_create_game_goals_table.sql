-- Game Events Table
-- Tracks which players scored goals, received yellow cards, or red cards in each game
-- This is optional - games can exist without event details
-- Each row represents one event by a player:
--   - One row per goal (event_type = 'goal')
--   - One row per yellow card (event_type = 'yellow_card')
--   - One row per red card (event_type = 'red_card')

CREATE TABLE IF NOT EXISTS game_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES roster(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_goals_game_id ON game_goals(game_id);
CREATE INDEX IF NOT EXISTS idx_game_goals_player_id ON game_goals(player_id);
CREATE INDEX IF NOT EXISTS idx_game_goals_game_player ON game_goals(game_id, player_id);
CREATE INDEX IF NOT EXISTS idx_game_goals_event_type ON game_goals(event_type);
CREATE INDEX IF NOT EXISTS idx_game_goals_game_event ON game_goals(game_id, event_type);

