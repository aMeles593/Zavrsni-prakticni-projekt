import axios from 'axios';
import dotenv from 'dotenv';
import db from '../db/db.js';
import broadcaster from '../lib/broadcast.js';

dotenv.config();

const API_KEY = process.env.API_KEY;

const headers = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': 'v3.football.api-sports.io'
};

export const fetchLeaguesFromAPI = async () => {
  const res = await axios.get(
    'https://v3.football.api-sports.io/leagues',
    { headers }
  );

  return res.data.response;
};

export const fetchAvailableSeasonsFromAPI = async (leagueId) => {
  try {
    console.log("CHECKING SEASONS FOR LEAGUE:", leagueId);
    
    const res = await axios.get(
      `https://v3.football.api-sports.io/leagues?id=${leagueId}`,
      { headers }
    );

    console.log("League response status:", res.status);
    console.log("League response errors:", res.data.errors);

    const league = res.data?.response?.[0];

    if (!league) {
      console.log("NO LEAGUE DATA FOUND");
      return [];
    }

    console.log("League name:", league.league.name);

    const seasons = Array.isArray(league.seasons)
      ? league.seasons
      : [];

    console.log(
      "RAW SEASONS FROM API:",
      seasons.map(s => ({
        year: s.year,
        start: s.start,
        end: s.end,
        current: s.current
      }))
    );

    const years = seasons
      .map(item => Number(item.year))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    console.log("PARSED YEARS:", years);

    return [...new Set(years)];

  } 
  catch (err) {

    console.error(
      "SEASONS ERROR:",
      err.response?.status,
      err.response?.data,
      err.message
    );

    return [];
  }
};

export const fetchFixturesFromAPI = async (leagueId, season) => {

  const seasons = [season];

  console.log("FETCH FIXTURES");
  console.log("LEAGUE:", leagueId);
  console.log("SEASONS TO CHECK:", seasons);

  let allFixtures = [];
  for (const season of seasons) {

    console.log("CHECKING SEASON:", season);
    try {
      const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`;

      console.log("REQUEST URL:", url);
      const res = await axios.get(url, { headers });

      console.log("STATUS:", res.status);
      console.log("API ERRORS:", res.data.errors);
      console.log("RESULT COUNT:", res.data.results);

      const fixtures = Array.isArray(res.data.response)
        ? res.data.response
        : [];

      if (fixtures.length > 0) {
        console.log(
          "FIRST MATCH EXAMPLE:",
          {
            id: fixtures[0].fixture.id,
            date: fixtures[0].fixture.date,
            home: fixtures[0].teams.home.name,
            away: fixtures[0].teams.away.name,
            round: fixtures[0].league.round
          }
        );

        allFixtures = allFixtures.concat(
          fixtures.map(item => ({
            ...item,
            season
          }))
        );
      } 
      else {
        console.log(
          "NO FIXTURES FOR SEASON:",
          season
        );
      }
    } 
    catch(err) {
      console.error(
        "FIXTURES ERROR:",
        {
          leagueId,
          season,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        }
      );
    }
  }

  console.log(
    "TOTAL FIXTURES COLLECTED:",
    allFixtures.length
  );

  return allFixtures;
};

export const saveFixturesToDB = async (fixtures, leagueId, db) => {
  for (const item of fixtures) {
    const f = item.fixture;
    const teams = item.teams;
    const goals = item.goals;

    const rawRound = item.league?.round ?? null;
    let roundName = null;
    let roundNumber = null;

    if (rawRound) {
      const match = rawRound.match(/^(.*?)(?: - (\d+))?$/);
      if (match) {
        roundName = match[1].trim();
        roundNumber = match[2] ? Number(match[2]) : null;
      }
    }

    let matchDate = f.date;
    try {
      matchDate = new Date(f.date).toISOString();
    } 
    catch (e) {
      console.error(
        "DATE PARSING ERROR:",
        f.date,
        e.message
      );        
    }

    await db.query(
      `
      INSERT INTO matches (
        api_match_id,
        league_id,
        season,
        home_team, 
        away_team,
        home_logo,
        away_logo,
        score_home,
        score_away,
        match_date,
        status,
        round_name,
        round_number
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      ON CONFLICT (api_match_id) DO UPDATE SET
        league_id = EXCLUDED.league_id,
        season = EXCLUDED.season,
        home_team = EXCLUDED.home_team,
        away_team = EXCLUDED.away_team,
        home_logo = EXCLUDED.home_logo,
        away_logo = EXCLUDED.away_logo,
        score_home = EXCLUDED.score_home,
        score_away = EXCLUDED.score_away,
        match_date = EXCLUDED.match_date,
        status = EXCLUDED.status,
        round_name = EXCLUDED.round_name,
        round_number = EXCLUDED.round_number
      `,
      [
        f.id,
        leagueId,
        item.season,
        teams.home.name,
        teams.away.name,
        teams.home.logo,
        teams.away.logo,
        goals.home ?? 0,
        goals.away ?? 0,
        matchDate,
        f.status.short,
        roundName,
        roundNumber
      ]
    );
  }
};

export async function fetchMatchEvents(matchId){
    const response = await fetch(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
        {
            headers
        }
    );
    const data = await response.json();
    return data.response;
};

export async function fetchMatchLineups(id){
    const url =
    `${process.env.API_URL}/fixtures/lineups?fixture=${id}`;
    const response = await fetch(url,{
    headers
    });
    if(!response.ok){
    throw new Error(
    `API error ${response.status}`
    );
    }
    const data = await response.json();
    return {
    home:data.response[0],
    away:data.response[1]
    };
}

export async function fetchMatchTeams(matchId){
    const response = await axios.get(
        `${process.env.API_URL}/fixtures?id=${matchId}`,
        {
            headers
        }
    );
    const fixture = response.data.response?.[0];
    if(!fixture){
        throw new Error(
            "Fixture not found"
        );
    }
    return {
        home_logo: fixture.teams.home.logo,
        away_logo: fixture.teams.away.logo
    };
}
export const fetchUpdatedFixtures = async (leagueId, season) => {
  try {
    console.log(
      "UPDATING FIXTURES:",
      leagueId,
      season
    );
    const url =
    `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`;
    const res = await axios.get(
      url,
      {
        headers
      }
    );
    const fixtures = res.data.response || [];
    return fixtures.map(item => ({
      ...item,
      season
    }));
  }
  catch(err){
    console.error(
      "UPDATE FIXTURES ERROR:",
      err.response?.data || err.message
    );
    throw err;
  }
};
export async function fetchLiveFixtures(){
    try{
        const response = await axios.get(
            `${process.env.API_URL}/fixtures?live=all`,
            {
                headers
            }
        );

        console.log(
            "API LIVE COUNT:",
            response.data.results
        );
        return response.data.response || [];
    }
    catch(err){

        console.error(
            "LIVE API ERROR:",
            err.response?.data || err.message
        );
        return [];
    }
}

export async function fetchFixtureById(matchId){
    const response = await axios.get(
        `${process.env.API_URL}/fixtures?id=${matchId}`,
        {
            headers
        }
    );

    const fixture =
    response.data.response?.[0];
    return fixture ?? null;
}

export async function saveEventsToDB(localMatchId, events, apiMatchId = null){
  if(!Array.isArray(events)){
      console.log(
          "EVENTS NOT ARRAY:",
          events
      );
      return;
  }

  const uniqueEvents = Array.from(
      new Map(
          events.map(event => {
              const key = [
                  localMatchId,
                  event.time?.elapsed ?? 0,
                  event.time?.extra ?? '',
                  event.type ?? '',
                  event.detail ?? '',
                  event.team?.id ?? '',
                  event.player?.id ?? '',
                  event.assist?.id ?? ''
              ].join('_');
              return [key,event];
          })
      ).values()
  );

  for(const event of uniqueEvents){

      const eventKey = [
          localMatchId,
          event.time?.elapsed ?? 0,
          event.time?.extra ?? '',
          event.type ?? '',
          event.detail ?? '',
          event.team?.id ?? '',
          event.player?.id ?? event.player?.name ?? '',
          event.assist?.id ?? event.assist?.name ?? ''
      ].join('_');

      const result = await db.query(
      `
      INSERT INTO match_events
      (
          match_id,
          minute,
          extra_minute,
          type,
          detail,
          team_id,
          team_name,
          player_id,
          player_name,
          assist_name,
          event_key
      )

      VALUES
      (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )

      ON CONFLICT (event_key)

      DO UPDATE SET

      detail = EXCLUDED.detail,
      player_id = EXCLUDED.player_id,
      player_name = EXCLUDED.player_name,
      assist_name = EXCLUDED.assist_name

      RETURNING id, (xmax = 0) AS is_new

      `,
      [
          localMatchId,
          event.time?.elapsed ?? 0,
          event.time?.extra ?? null,
          event.type ?? null,
          event.detail ?? null,
          event.team?.id ?? null,
          event.team?.name ?? null,
          event.player?.id ?? null,
          event.player?.name ?? null,
          event.assist?.name ?? null,
          eventKey
      ]);

      if(result.rows.length > 0 && result.rows[0].is_new && apiMatchId){
          broadcaster.emit(
              'broadcast',
              'match_event',
              {
                  matchId: apiMatchId,
                  event
              }
          );
      }
  }
}