--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-09-09 10:50:59

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 17921)
-- Name: leagues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leagues (
    id integer NOT NULL,
    api_id integer,
    name character varying(255),
    country character varying(100),
    logo text,
    featured boolean DEFAULT false
);


ALTER TABLE public.leagues OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17920)
-- Name: leagues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leagues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leagues_id_seq OWNER TO postgres;

--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 217
-- Name: leagues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leagues_id_seq OWNED BY public.leagues.id;


--
-- TOC entry 224 (class 1259 OID 18113)
-- Name: match_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_events (
    id integer NOT NULL,
    match_id integer,
    minute integer,
    extra_minute integer,
    type character varying(50),
    detail character varying(100),
    team_id integer,
    team_name character varying(100),
    player_id integer,
    player_name character varying(100),
    assist_name character varying(100),
    assist_key text DEFAULT ''::text,
    event_key text
);


ALTER TABLE public.match_events OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 18112)
-- Name: match_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_events_id_seq OWNER TO postgres;

--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 223
-- Name: match_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_events_id_seq OWNED BY public.match_events.id;


--
-- TOC entry 222 (class 1259 OID 18005)
-- Name: match_lineups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_lineups (
    id integer NOT NULL,
    match_id integer,
    team_name character varying(100),
    player_id integer,
    player_name character varying(100),
    "position" character varying(20),
    number integer,
    starter boolean,
    substitute boolean
);


ALTER TABLE public.match_lineups OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18004)
-- Name: match_lineups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_lineups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_lineups_id_seq OWNER TO postgres;

--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 221
-- Name: match_lineups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_lineups_id_seq OWNED BY public.match_lineups.id;


--
-- TOC entry 220 (class 1259 OID 17954)
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    league_id integer NOT NULL,
    season character varying(10) NOT NULL,
    api_match_id integer,
    home_team character varying(100),
    away_team character varying(100),
    match_date timestamp without time zone,
    status character varying(20),
    score_home integer,
    score_away integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    round character varying,
    round_name text,
    round_number integer,
    home_logo text,
    away_logo text,
    live_minute integer
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17953)
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matches_id_seq OWNER TO postgres;

--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 219
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- TOC entry 233 (class 1259 OID 18594)
-- Name: player_season_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_season_cache (
    id integer NOT NULL,
    api_player_id integer NOT NULL,
    season integer NOT NULL,
    fetched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.player_season_cache OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 18593)
-- Name: player_season_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_season_cache_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_season_cache_id_seq OWNER TO postgres;

--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 232
-- Name: player_season_cache_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_season_cache_id_seq OWNED BY public.player_season_cache.id;


--
-- TOC entry 231 (class 1259 OID 18571)
-- Name: player_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_statistics (
    id integer NOT NULL,
    player_id integer NOT NULL,
    team_id integer,
    team_name character varying(255),
    team_logo text,
    competition_id integer,
    competition_name character varying(255),
    competition_logo text,
    appearances integer DEFAULT 0,
    lineups integer DEFAULT 0,
    minutes integer DEFAULT 0,
    goals integer DEFAULT 0,
    assists integer DEFAULT 0,
    yellow_cards integer DEFAULT 0,
    red_cards integer DEFAULT 0
);


ALTER TABLE public.player_statistics OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18570)
-- Name: player_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_statistics_id_seq OWNER TO postgres;

--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 230
-- Name: player_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_statistics_id_seq OWNED BY public.player_statistics.id;


--
-- TOC entry 229 (class 1259 OID 18535)
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    api_player_id integer NOT NULL,
    season integer NOT NULL,
    name character varying(255),
    firstname character varying(255),
    lastname character varying(255),
    age integer,
    nationality character varying(100),
    height character varying(20),
    weight character varying(20),
    photo text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.players OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18534)
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO postgres;

--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 228
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- TOC entry 226 (class 1259 OID 18204)
-- Name: sync_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sync_status (
    id integer NOT NULL,
    league_id integer NOT NULL,
    sync_type character varying(50) NOT NULL,
    last_sync timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sync_status OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18203)
-- Name: sync_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sync_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sync_status_id_seq OWNER TO postgres;

--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 225
-- Name: sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sync_status_id_seq OWNED BY public.sync_status.id;


--
-- TOC entry 4680 (class 2604 OID 17924)
-- Name: leagues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues ALTER COLUMN id SET DEFAULT nextval('public.leagues_id_seq'::regclass);


--
-- TOC entry 4685 (class 2604 OID 18116)
-- Name: match_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_events ALTER COLUMN id SET DEFAULT nextval('public.match_events_id_seq'::regclass);


--
-- TOC entry 4684 (class 2604 OID 18008)
-- Name: match_lineups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_lineups ALTER COLUMN id SET DEFAULT nextval('public.match_lineups_id_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 17957)
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- TOC entry 4700 (class 2604 OID 18597)
-- Name: player_season_cache id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_season_cache ALTER COLUMN id SET DEFAULT nextval('public.player_season_cache_id_seq'::regclass);


--
-- TOC entry 4692 (class 2604 OID 18574)
-- Name: player_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_statistics ALTER COLUMN id SET DEFAULT nextval('public.player_statistics_id_seq'::regclass);


--
-- TOC entry 4689 (class 2604 OID 18538)
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- TOC entry 4687 (class 2604 OID 18207)
-- Name: sync_status id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_status ALTER COLUMN id SET DEFAULT nextval('public.sync_status_id_seq'::regclass);


--
-- TOC entry 4707 (class 2606 OID 17967)
-- Name: matches fixtures_api_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT fixtures_api_id_unique UNIQUE (api_match_id);


--
-- TOC entry 4703 (class 2606 OID 17930)
-- Name: leagues leagues_api_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_api_id_unique UNIQUE (api_id);


--
-- TOC entry 4705 (class 2606 OID 17928)
-- Name: leagues leagues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT leagues_pkey PRIMARY KEY (id);


--
-- TOC entry 4716 (class 2606 OID 18274)
-- Name: match_events match_events_event_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_event_key_key UNIQUE (event_key);


--
-- TOC entry 4718 (class 2606 OID 18118)
-- Name: match_events match_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4714 (class 2606 OID 18010)
-- Name: match_lineups match_lineups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_lineups
    ADD CONSTRAINT match_lineups_pkey PRIMARY KEY (id);


--
-- TOC entry 4710 (class 2606 OID 18127)
-- Name: matches matches_api_match_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_api_match_id_unique UNIQUE (api_match_id);


--
-- TOC entry 4712 (class 2606 OID 17960)
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 18602)
-- Name: player_season_cache player_season_cache_api_player_id_season_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_season_cache
    ADD CONSTRAINT player_season_cache_api_player_id_season_key
    UNIQUE (api_player_id, season);


--
-- TOC entry 4734 (class 2606 OID 18600)
-- Name: player_season_cache player_season_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_season_cache
    ADD CONSTRAINT player_season_cache_pkey PRIMARY KEY (id);


--
-- TOC entry 4728 (class 2606 OID 18585)
-- Name: player_statistics player_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_statistics
    ADD CONSTRAINT player_statistics_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 18587)
-- Name: player_statistics player_statistics_player_id_team_id_competition_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_statistics
    ADD CONSTRAINT player_statistics_player_id_team_id_competition_id_key
    UNIQUE (player_id, team_id, competition_id);


--
-- TOC entry 4724 (class 2606 OID 18546)
-- Name: players players_api_player_id_season_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_api_player_id_season_key
    UNIQUE (api_player_id, season);


--
-- TOC entry 4726 (class 2606 OID 18544)
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 18212)
-- Name: sync_status sync_status_league_id_sync_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_status
    ADD CONSTRAINT sync_status_league_id_sync_type_key
    UNIQUE (league_id, sync_type);


--
-- TOC entry 4722 (class 2606 OID 18210)
-- Name: sync_status sync_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_status
    ADD CONSTRAINT sync_status_pkey PRIMARY KEY (id);


--
-- TOC entry 4708 (class 1259 OID 17972)
-- Name: idx_matches_league_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_matches_league_season
    ON public.matches USING btree (league_id, season);


--
-- TOC entry 4737 (class 2606 OID 18121)
-- Name: match_events match_events_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_events
    ADD CONSTRAINT match_events_match_id_fkey
    FOREIGN KEY (match_id) REFERENCES public.matches(api_match_id);


--
-- TOC entry 4736 (class 2606 OID 18011)
-- Name: match_lineups match_lineups_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_lineups
    ADD CONSTRAINT match_lineups_match_id_fkey
    FOREIGN KEY (match_id) REFERENCES public.matches(id);


--
-- TOC entry 4735 (class 2606 OID 17961)
-- Name: matches matches_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_league_id_fkey
    FOREIGN KEY (league_id) REFERENCES public.leagues(id);


--
-- TOC entry 4739 (class 2606 OID 18588)
-- Name: player_statistics player_statistics_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_statistics
    ADD CONSTRAINT player_statistics_player_id_fkey
    FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- TOC entry 4738 (class 2606 OID 18359)
-- Name: sync_status sync_status_league_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_status
    ADD CONSTRAINT sync_status_league_id_fkey
    FOREIGN KEY (league_id) REFERENCES public.leagues(id);


-- Completed on 2026-09-09 10:50:59

--
-- PostgreSQL database dump complete
--