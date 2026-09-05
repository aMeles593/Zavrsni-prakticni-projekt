import db from '../db/db.js';

export const getFeaturedLeagues = async () => {
  const result = await db.query(`
    SELECT * FROM leagues
    WHERE featured = true
    ORDER BY api_id
  `);
  return result.rows;
};

export const getExploreLeagues = async () => {
  const exploredIds = [39, 140, 61, 88, 94, 135, 4, 1, 2, 3];
  const result = await db.query(`
    SELECT * FROM leagues
    WHERE api_id = ANY($1)
  `, [exploredIds]);

  if (result.rows.length === 0) {
    return exploredIds.map((id) => ({ api_id: id }));
  }

  return result.rows;
};

export const insertLeague = async (league) => {
  const query = `
    INSERT INTO leagues (api_id, name, country, logo)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (api_id) DO NOTHING
  `;

  await db.query(query, [
    league.id,
    league.name,
    league.country,
    league.logo
  ]);
};