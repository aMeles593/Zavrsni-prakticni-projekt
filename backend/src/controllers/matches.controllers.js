import { fetchFixturesFromAPI, fetchUpdatedFixtures, saveFixturesToDB, fetchMatchTeams, fetchMatchEvents, saveEventsToDB, fetchAvailableSeasonsFromAPI} from '../services/apiFootball.js';
import { getExploreLeagues } from '../services/leagues.js';
import db from '../db/db.js';

export const syncMatches = async (req, res) => {
  try {
    const leagueId = req.params.leagueId;

    console.log('SYNC START FOR LEAGUE:', leagueId);

    const fixtures = await fetchFixturesFromAPI(leagueId);

    console.log('FIXTURES RECEIVED:', fixtures.length);

    await saveFixturesToDB(fixtures, leagueId, db);

    res.json({
      message: 'Matches synced successfully',
      count: fixtures.length
    });

  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getFixtures = async (req, res) => {
  try {
    const leagueId = Number(req.query.league);
    const season = String(req.query.season ?? '2024');
    const result = await db.query(
      `
      SELECT 
        m.*,
        l.name AS league_name,
        l.logo AS league_logo
      FROM matches m
      LEFT JOIN leagues l ON l.api_id = m.league_id
      WHERE m.league_id = $1
        AND CAST(m.season AS TEXT) = $2
      ORDER BY COALESCE(m.round_number, 999999), m.match_date ASC, m.home_team ASC
      `,
      [leagueId, season]
    );
    res.json(result.rows);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
export const backfillRounds = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const fixtures = await fetchFixturesFromAPI(leagueId);
    for (const item of fixtures) {
      const rawRound = item.league?.round ?? null;
      let round_name = null;
      let round_number = null;
      if (rawRound) {
        const match = rawRound.match(/^(.*?)(?: - (\d+))?$/);
        if (match) {
          round_name = match[1].trim();
          round_number = match[2] ? Number(match[2]) : null;
        }
      }
      await db.query(
        `
        UPDATE matches
        SET round_name = $1,
            round_number = $2
        WHERE api_match_id = $3
        `,
        [round_name, round_number, item.fixture.id]
      );
    }
    res.json({
      message: 'Rounds updated',
      count: fixtures.length
    });

  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getSeasons = async (req, res) => {
  try {
    const leagueId = Number(req.query.league);
    const result = await db.query(
      `
      SELECT DISTINCT season
      FROM matches
      WHERE league_id = $1
      ORDER BY season DESC
      `,
      [leagueId]
    );
    const dbSeasons = result.rows
      .map(r => Number(r.season))
      .filter(Number.isFinite);

    const apiSeasons = await fetchAvailableSeasonsFromAPI(leagueId);

    const seasons = [...new Set([...dbSeasons, ...apiSeasons])]
      .filter(Number.isFinite)
      .sort((a, b) => b - a);

    res.json(seasons.length > 0 ? seasons : [new Date().getFullYear()]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `
      SELECT 
        m.*,
        l.name AS league_name,
        l.logo AS league_logo
      FROM matches m
      LEFT JOIN leagues l 
        ON l.api_id = m.league_id
      WHERE m.api_match_id = $1
      `,
      [
        id
      ]
    );


    if(result.rows.length === 0){
      return res.status(404).json({
        error:'Match not found'
      });
    }
    const match = result.rows[0];

    if(!match.home_logo || !match.away_logo){
      console.log(
        "FETCHING TEAM LOGOS:",
        match.api_match_id
      );
      const logos = await fetchMatchTeams(
        match.api_match_id
      );
      await db.query(
        `
        UPDATE matches
        SET 
          home_logo=$1,
          away_logo=$2
        WHERE api_match_id=$3
        `,
        [
          logos.home_logo,
          logos.away_logo,
          match.api_match_id
        ]
      );
      match.home_logo = logos.home_logo;
      match.away_logo = logos.away_logo;
    }
    res.json(match);
  }
  catch(err){
    console.error(err);
    res.status(500).json({
      error:err.message
    });
  }
};

export const updateMatches = async (req,res)=>{
  try{
    const leagueId = req.params.leagueId;
    const season = req.params.season;
    console.log(
      "UPDATE START:",
      leagueId,
      season
    );
    const fixtures =
    await fetchUpdatedFixtures(
      leagueId, 
      season
    );
    console.log(
      "FIXTURES UPDATED:",
      fixtures.length
    );
    await saveFixturesToDB(
      fixtures,
      leagueId,
      db
    );
    res.json({
      message:"Matches updated successfully",
      count:fixtures.length
    });
  }
  catch(err){
    console.error(err);
    res.status(500).json({
      error:err.message
    });
  }

};
export const getLiveMatches = async (req, res) => {
  try {
    console.log("GET LIVE MATCHES");

    const exploreLeagues = await getExploreLeagues();

    console.log("EXPLORE LEAGUES:", exploreLeagues);


    const allowed = (exploreLeagues || [])
      .map(x => Number(x.api_id))
      .filter(Number.isFinite);


    console.log("ALLOWED LEAGUE IDS:", allowed);


    if (allowed.length === 0) {

      console.log("NO ALLOWED LEAGUES");

      return res.json([]);

    }


    const liveInDB = await db.query(`
      SELECT
        api_match_id,
        league_id,
        home_team,
        away_team,
        score_home,
        score_away,
        status,
        live_minute
      FROM matches
      WHERE status IN (
        '1H',
        '2H',
        'HT',
        'ET',
        'P',
        'LIVE'
      )
      ORDER BY match_date ASC
    `);


    console.log(
      "LIVE MATCHES IN DB:",
      liveInDB.rows.length
    );

    console.log(
      "LIVE MATCHES DATA:",
      liveInDB.rows
    );

    const result = await db.query(
      `
      SELECT
        m.api_match_id,
        m.league_id,
        l.name AS league_name,
        l.logo AS league_logo,

        m.home_team,
        m.away_team,

        m.home_logo,
        m.away_logo,

        m.score_home,
        m.score_away,

        m.status,
        m.live_minute,
        m.match_date,

        m.round_name,
        m.round_number

      FROM matches m

      LEFT JOIN leagues l
        ON l.api_id = m.league_id

      WHERE m.status IN (
        '1H',
        '2H',
        'HT',
        'ET',
        'P',
        'LIVE'
      )

      AND m.league_id = ANY($1)

      ORDER BY
        m.match_date ASC,
        m.league_id ASC
      `,
      [allowed]
    );
    console.log(
      "LIVE MATCHES AFTER LEAGUE FILTER:",
      result.rows.length
    );
    console.log(
      "FINAL LIVE MATCHES:",
      result.rows
    );

    res.json(result.rows);
  }
  catch (err) {
    console.error(
      "GET LIVE MATCHES ERROR:",
      err
    );
    res.status(500).json({
      error: err.message
    });
  }
};

export const getMatchEvents = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("SYNC EVENTS FROM API:", id);

    const apiEvents = await fetchMatchEvents(id);
    console.log(
        "API EVENTS:",
        apiEvents.length
    );
    if(apiEvents.length > 0){
        await saveEventsToDB(
            id,
            apiEvents,
            id
        );
    }
    const saved = await db.query(
    `
    SELECT
        me.id,
        me.minute,
        me.extra_minute,
        me.team_name,
        me.player_name,
        me.assist_name,
        me.type,
        me.detail
    FROM match_events me
    WHERE me.match_id = $1
    ORDER BY me.minute ASC, me.id ASC
    `,
    [
        id
    ]);
    res.json(saved.rows);
  }
  catch(err){
    console.error(
        "EVENTS ERROR:",
        err
    );
    res.status(500).json({
        error:err.message
    });
  }
};