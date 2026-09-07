import db from '../db/db.js';

import {fetchPlayer, savePlayerToDB} from '../services/apiFootball.js';


export const getPlayer = async (req, res) => {

    try {

        const playerId =
            Number(req.params.id);

        const season =
            Number(req.query.season);


        if (!playerId) {

            return res.status(400).json({
                error: 'Invalid player ID'
            });

        }


        if (!season) {

            return res.status(400).json({
                error: 'Season is required'
            });

        }


        console.log(
            'GET PLAYER:',
            playerId,
            'SEASON:',
            season
        );

        const cacheResult = await db.query(
            `
            SELECT id
            FROM player_season_cache
            WHERE api_player_id = $1
              AND season = $2
            `,
            [
                playerId,
                season
            ]
        );

        if (cacheResult.rows.length > 0) {

            console.log(
                'PLAYER SEASON FOUND IN CACHE:',
                season
            );


            const playerResult =
                await db.query(
                    `
                    SELECT *
                    FROM players
                    WHERE api_player_id = $1
                      AND season = $2
                    `,
                    [
                        playerId,
                        season
                    ]
                );

            if (playerResult.rows.length === 0) {

                return res.status(404).json({
                    error: 'Player not found'
                });

            }


            const player =
                playerResult.rows[0];

            const statsResult =
                await db.query(
                    `
                    SELECT

                        team_id,
                        team_name,
                        team_logo,

                        competition_id,
                        competition_name,
                        competition_logo,

                        appearances,
                        lineups,
                        minutes,

                        goals,
                        assists,

                        yellow_cards,
                        red_cards

                    FROM player_statistics

                    WHERE player_id = $1

                    ORDER BY competition_name
                    `,
                    [
                        player.id
                    ]
                );


            const statistics =
                statsResult.rows.map(stat => ({

                    season: season,

                    team: {

                        id: stat.team_id,

                        name: stat.team_name,

                        logo: stat.team_logo

                    },

                    league: {

                        id: stat.competition_id,

                        name:
                            stat.competition_name,

                        logo:
                            stat.competition_logo

                    },

                    games: {

                        appearences:
                            stat.appearances,

                        lineups:
                            stat.lineups,

                        minutes:
                            stat.minutes

                    },

                    goals: {

                        total:
                            stat.goals,

                        assists:
                            stat.assists

                    },

                    cards: {

                        yellow:
                            stat.yellow_cards,

                        red:
                            stat.red_cards

                    }

                }));


            return res.json({

                player: {

                    id:
                        player.api_player_id,

                    name:
                        player.name,

                    firstname:
                        player.firstname,

                    lastname:
                        player.lastname,

                    age:
                        player.age,

                    nationality:
                        player.nationality,

                    height:
                        player.height,

                    weight:
                        player.weight,

                    photo:
                        player.photo

                },

                statistics

            });

        }

        console.log(
            'PLAYER SEASON NOT IN CACHE → API:',
            season
        );


        const apiPlayer =
            await fetchPlayer(
                playerId,
                season
            );

        if (!apiPlayer) {

            console.log(
                'NO PLAYER STATISTICS FOR SEASON:',
                playerId,
                season
            );

            await db.query(
                `
                INSERT INTO player_season_cache (
                    api_player_id,
                    season
                )
                VALUES ($1, $2)

                ON CONFLICT (
                    api_player_id,
                    season
                )
                DO NOTHING
                `,
                [
                    playerId,
                    season
                ]
            );

            const playerResult =
                await db.query(
                    `
                    SELECT *
                    FROM players
                    WHERE api_player_id = $1
                    ORDER BY season DESC
                    LIMIT 1
                    `,
                    [
                        playerId
                    ]
                );


            if (playerResult.rows.length === 0) {

                return res.status(404).json({
                    error: 'Player not found'
                });

            }


            const player =
                playerResult.rows[0];

            return res.json({

                player: {

                    id:
                        player.api_player_id,

                    name:
                        player.name,

                    firstname:
                        player.firstname,

                    lastname:
                        player.lastname,

                    age:
                        player.age,

                    nationality:
                        player.nationality,

                    height:
                        player.height,

                    weight:
                        player.weight,

                    photo:
                        player.photo

                },

                statistics: []

            });

        }

        const localPlayerId =
            await savePlayerToDB(
                apiPlayer,
                season
            );


        console.log(
            'PLAYER SAVED:',
            playerId,
            season
        );

        const statistics =
            (apiPlayer.statistics || [])
            .map(stat => ({

                season: season,

                team: {

                    id:
                        stat.team?.id ?? null,

                    name:
                        stat.team?.name ?? null,

                    logo:
                        stat.team?.logo ?? null

                },

                league: {

                    id:
                        stat.league?.id ?? null,

                    name:
                        stat.league?.name ?? null,

                    logo:
                        stat.league?.logo ?? null

                },

                games: {

                    appearences:
                        stat.games?.appearences ?? 0,

                    lineups:
                        stat.games?.lineups ?? 0,

                    minutes:
                        stat.games?.minutes ?? 0

                },

                goals: {

                    total:
                        stat.goals?.total ?? 0,

                    assists:
                        stat.goals?.assists ?? 0

                },

                cards: {

                    yellow:
                        stat.cards?.yellow ?? 0,

                    red:
                        stat.cards?.red ?? 0

                }

            }));


        return res.json({

            player: {

                id:
                    apiPlayer.player.id,

                name:
                    apiPlayer.player.name,

                firstname:
                    apiPlayer.player.firstname,

                lastname:
                    apiPlayer.player.lastname,

                age:
                    apiPlayer.player.age,

                nationality:
                    apiPlayer.player.nationality,

                height:
                    apiPlayer.player.height,

                weight:
                    apiPlayer.player.weight,

                photo:
                    apiPlayer.player.photo

            },

            statistics

        });


    }
    catch (err) {

        console.error(
            'GET PLAYER ERROR:',
            err
        );


        return res.status(500).json({
            error: err.message
        });

    }

};

export const getPlayerSeasons = async (req, res) => {

    try {

        const result =
            await db.query(
                `
                SELECT DISTINCT season

                FROM matches

                WHERE season IS NOT NULL

                ORDER BY season DESC
                `
            );


        const seasons =
            result.rows.map(
                row => Number(row.season)
            );


        return res.json(
            seasons
        );

    }
    catch (err) {

        console.error(
            'GET PLAYER SEASONS ERROR:',
            err
        );


        return res.status(500).json({
            error: err.message
        });

    }

};