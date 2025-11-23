-- Insert sample teams
INSERT INTO teams (id, name, masjid_name, points, games_played, wins, draws, losses, goals_for, goals_against, goal_difference) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Masjid Al-Huda', 'Masjid Al-Huda', 15, 5, 5, 0, 0, 18, 8, 10),
  ('00000000-0000-0000-0000-000000000002', 'Islamic Center', 'Islamic Center of Brampton', 10, 4, 3, 1, 0, 15, 12, 3),
  ('00000000-0000-0000-0000-000000000003', 'Brampton Islamic Center', 'Brampton Islamic Center', 7, 3, 2, 1, 0, 14, 13, 1),
  ('00000000-0000-0000-0000-000000000004', 'Masjid Al-Noor', 'Masjid Al-Noor', 7, 3, 2, 1, 0, 12, 10, 2),
  ('00000000-0000-0000-0000-000000000005', 'Islamic Society', 'Islamic Society of Brampton', 4, 2, 1, 1, 0, 10, 15, -5),
  ('00000000-0000-0000-0000-000000000006', 'Masjid Al-Falah', 'Masjid Al-Falah', 1, 1, 0, 1, 0, 6, 17, -11)
ON CONFLICT (id) DO UPDATE SET
  points = EXCLUDED.points,
  games_played = EXCLUDED.games_played,
  wins = EXCLUDED.wins,
  draws = EXCLUDED.draws,
  losses = EXCLUDED.losses,
  goals_for = EXCLUDED.goals_for,
  goals_against = EXCLUDED.goals_against,
  goal_difference = EXCLUDED.goal_difference;

-- Insert sample games (Week 7 - Nov 23, 2025)
INSERT INTO games (id, match_id, week, game_date, game_time, location, home_team_id, away_team_id, home_score, away_score, status) VALUES
  ('70000000-0000-0000-0000-000000000001', 'WEEK7-GAME1', 7, '2025-11-23', '20:30:00', 
   'Field 1', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 0, 4, 'completed'),
  ('70000000-0000-0000-0000-000000000002', 'WEEK7-GAME2', 7, '2025-11-23', '21:30:00',
   'Field 2', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 2, 2, 'completed'),
  ('70000000-0000-0000-0000-000000000003', 'WEEK7-GAME3', 7, '2025-11-23', '22:30:00',
   'Field 1', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 3, 1, 'completed')
ON CONFLICT DO NOTHING;
