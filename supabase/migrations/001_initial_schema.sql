-- BIMSL Database Schema - Simplified
-- Create tables for teams and their statistics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table with statistics
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  masjid_name VARCHAR(255),
  points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0, -- goals_for - goals_against
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games/Matches table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id VARCHAR(100) UNIQUE, -- Optional custom match ID (e.g., "WEEK1-GAME1")
  week INTEGER NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL, -- Field/location name (e.g., "Field 1", "Save Max Sports Centre")
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (home_team_id != away_team_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_home_team ON games(home_team_id);
CREATE INDEX IF NOT EXISTS idx_games_away_team ON games(away_team_id);
CREATE INDEX IF NOT EXISTS idx_games_week ON games(week);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
CREATE INDEX IF NOT EXISTS idx_games_match_id ON games(match_id);
CREATE INDEX IF NOT EXISTS idx_games_location ON games(location);
CREATE INDEX IF NOT EXISTS idx_teams_points ON teams(points DESC);
CREATE INDEX IF NOT EXISTS idx_teams_goal_difference ON teams(goal_difference DESC);
