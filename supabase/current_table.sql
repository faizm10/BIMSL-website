-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.game_goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  game_id uuid NOT NULL,
  player_id uuid NOT NULL,
  event_type character varying NOT NULL CHECK (event_type::text = ANY (ARRAY['goal'::character varying, 'yellow_card'::character varying, 'red_card'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_goals_pkey PRIMARY KEY (id),
  CONSTRAINT game_goals_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id),
  CONSTRAINT game_goals_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.roster(id)
);
CREATE TABLE public.games (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  match_id character varying UNIQUE,
  week integer NOT NULL,
  game_date date NOT NULL,
  game_time time without time zone NOT NULL,
  location character varying NOT NULL,
  home_team_id uuid NOT NULL,
  away_team_id uuid NOT NULL,
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  status character varying DEFAULT 'scheduled'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_playoff boolean DEFAULT false,
  is_published boolean DEFAULT false,
  CONSTRAINT games_pkey PRIMARY KEY (id),
  CONSTRAINT games_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id),
  CONSTRAINT games_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.roster (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  full_name character varying NOT NULL,
  jersey_number integer,
  goals integer DEFAULT 0,
  assists integer DEFAULT 0,
  yellow_cards integer DEFAULT 0,
  red_cards integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT roster_pkey PRIMARY KEY (id),
  CONSTRAINT roster_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  masjid_name character varying,
  points integer DEFAULT 0,
  games_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  losses integer DEFAULT 0,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  goal_difference integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);