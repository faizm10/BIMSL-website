# BIMSL Database Schema

This directory contains SQL migration scripts for the Brampton Intra-Masjid Soccer League database.

## Files

- `001_initial_schema.sql` - Creates database tables, indexes, triggers, and functions
- `002_insert_sample_data.sql` - Inserts sample teams and games

## Database Structure

### Tables

1. **teams** - Stores team information and statistics
   - id, name, masjid_name
   - points, games_played, wins, draws, losses
   - goals_for, goals_against, goal_difference
   - created_at, updated_at

2. **games** - Stores game/match information
   - id (UUID primary key)
   - match_id (optional custom match identifier, e.g., "WEEK1-GAME1")
   - week, game_date, game_time
   - location (field/location name)
   - home_team_id, away_team_id
   - home_score, away_score, status
   - created_at, updated_at

## Features

- **Automatic Timestamps**: All tables have `created_at` and `updated_at` fields that are automatically managed
- **Automatic Stats Calculation**: Triggers automatically update team stats when games are completed
- **Data Integrity**: Foreign key constraints ensure data consistency
- **Performance**: Indexes on frequently queried columns for optimal performance

## Running Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `001_initial_schema.sql`
4. Run the query
5. Repeat for `002_insert_sample_data.sql` (optional, for sample data)

### Using Supabase CLI

```bash
# Apply migrations
supabase db push

# Or apply specific migration
supabase migration up
```

### Using psql

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/002_insert_sample_data.sql
```

## Sample Queries

### Get all teams ordered by points
```sql
SELECT 
  name,
  points,
  games_played,
  wins,
  draws,
  losses,
  goals_for,
  goals_against,
  goal_difference
FROM teams
ORDER BY points DESC, goal_difference DESC, goals_for DESC;
```

### Get team standings
```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY points DESC, goal_difference DESC, goals_for DESC) AS position,
  name,
  points,
  games_played,
  wins,
  draws,
  losses,
  goals_for,
  goals_against,
  goal_difference
FROM teams
ORDER BY points DESC, goal_difference DESC, goals_for DESC;
```

### Get upcoming games
```sql
SELECT 
  g.match_id,
  g.week,
  g.game_date,
  g.game_time,
  g.location,
  ht.name AS home_team,
  at.name AS away_team
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE g.status = 'scheduled'
ORDER BY g.game_date, g.game_time;
```

### Get completed games
```sql
SELECT 
  g.match_id,
  g.week,
  g.game_date,
  g.game_time,
  g.location,
  ht.name AS home_team,
  g.home_score,
  g.away_score,
  at.name AS away_team
FROM games g
JOIN teams ht ON g.home_team_id = ht.id
JOIN teams at ON g.away_team_id = at.id
WHERE g.status = 'completed'
ORDER BY g.game_date DESC, g.game_time DESC;
```

## Notes

- Team stats are automatically updated when games are marked as completed
- Points are calculated as: wins * 3 + draws
- Goal difference is automatically calculated as: goals_for - goals_against
- All UUIDs in sample data use predictable UUIDs for easier testing
