import { fetchLeaguesFromAPI, fetchFixturesFromAPI, saveFixturesToDB } from '../services/apiFootball.js';
import {insertLeague,getFeaturedLeagues,getExploreLeagues} from '../services/leagues.js';
import db from '../db/db.js';


export const syncLeagues = async (req, res) => {
  try {
    const leagues = await fetchLeaguesFromAPI();

    for (const item of leagues) {
      await insertLeague({
        id: item.league.id,
        name: item.league.name,
        country: item.country.name,
        logo: item.league.logo
      });

      try{
        const fixtures = await fetchFixturesFromAPI(item.league.id);
        if(Array.isArray(fixtures) && fixtures.length > 0){
          await saveFixturesToDB(fixtures, item.league.id, db);
          console.log('Saved fixtures for league', item.league.id, 'count:', fixtures.length);
        } else {
          console.log('No fixtures returned for league', item.league.id);
        }
      }
      catch(err){
        console.error('Error fetching/saving fixtures for league', item.league.id, err.message || err);
      }
    }

    res.json({ message: 'Leagues synced successfully' });
  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHomeLeagues = async (req, res) => {
  try {
    const featured = await getFeaturedLeagues();
    const explore = await getExploreLeagues();
    res.json({
      featured,
      explore
    });
  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeagues = async (req, res) => {
  try {
    const data = await getAllLeagues();
    res.json(data);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeagueById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM leagues WHERE api_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json(result.rows[0]);

  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};