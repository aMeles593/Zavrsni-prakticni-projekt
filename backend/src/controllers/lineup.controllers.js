import db from '../db/db.js';
import { fetchMatchLineups } from '../services/apiFootball.js';

const positionOrder = {
    G: 1,
    D: 2,
    M: 3,
    F: 4
};


const sortPlayers = (players)=>{

    return players.sort((a,b)=>{

        const posA = positionOrder[a.player.position] || 99;
        const posB = positionOrder[b.player.position] || 99;

        return posA - posB;

    });

};

export const getLineups = async (req,res)=>{
    try {
        const apiMatchId = req.params.id;

        const existing = await db.query(
        `
        SELECT *
        FROM match_lineups
        WHERE match_id = (
            SELECT id
            FROM matches
            WHERE api_match_id=$1
        )
        ORDER BY team_name, starter DESC
        `,
        [
            apiMatchId
        ]);


        if(existing.rows.length > 0){
            const teams = [...new Set(existing.rows.map(x => x.team_name))];
            const grouped = {
                home:{
                    team:{
                        name: teams[0]
                    },
                    formation:null,
                    starters:[],
                    substitutes:[]
                },
                away:{
                    team:{
                        name: teams[1]
                    },
                    formation:null,
                    starters:[],
                    substitutes:[]
                }
            };
            existing.rows.forEach(player=>{
                const playerObject = {
                    player:{
                        name:player.player_name,
                        number:player.number,
                        position:player.position,
                        starter: player.starter,
                        substitute: player.substitute
                    }
                };
                if(player.team_name === teams[0]){
                    if(player.starter){
                        grouped.home.starters.push(playerObject);
                    }
                    else{
                        grouped.home.substitutes.push(playerObject);
                    }
                }
                else{
                    if(player.starter){
                        grouped.away.starters.push(playerObject);
                    }
                    else{
                        grouped.away.substitutes.push(playerObject);
                    }
                }
            });
            grouped.home.starters = sortPlayers(grouped.home.starters);
            grouped.home.substitutes = sortPlayers(grouped.home.substitutes);
            grouped.away.starters = sortPlayers(grouped.away.starters);
            grouped.away.substitutes = sortPlayers(grouped.away.substitutes);

            return res.json(grouped);
        }

        const lineups = await fetchMatchLineups(apiMatchId);
        if (!lineups || (!lineups.home && !lineups.away)) {
            return res.status(404).json({ error: 'Lineups not available for this match' });
        }

        const sides = [];
        if (lineups.home) sides.push({ side: lineups.home, type: 'home' });
        if (lineups.away) sides.push({ side: lineups.away, type: 'away' });

        for (const { side } of sides) {
            const teamName = side.team?.name ?? 'Unknown Team';
            const players = [
                ...(Array.isArray(side.startXI) ? side.startXI : []),
                ...(Array.isArray(side.substitutes) ? side.substitutes : [])
            ];
            for (const item of players) {
                await db.query(
                `
                INSERT INTO match_lineups
                (
                    match_id,
                    number,
                    starter,
                    substitute,
                    player_id,
                    team_name,
                    position,
                    player_name
                )
                VALUES
                (
                (
                    SELECT id
                    FROM matches
                    WHERE api_match_id=$1
                ),
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8

                )

                `,
                [
                apiMatchId,
                item.player?.number ?? null,
                Array.isArray(side.startXI) && side.startXI.includes(item),
                Array.isArray(side.substitutes) && side.substitutes.includes(item),
                item.player?.id ?? null,
                teamName,
                item.player?.pos ?? null,
                item.player?.name ?? null
                ]);
            }
        }

        const saved = await db.query(
        `
        SELECT *
        FROM match_lineups
        WHERE match_id = (
            SELECT id
            FROM matches
            WHERE api_match_id=$1
        )
        ORDER BY team_name, starter DESC
        `,
        [
            apiMatchId
        ]);
        const teams = [...new Set(saved.rows.map(x => x.team_name))];
        const response = {
            home:{
                team:{
                    name:teams[0]
                },
                formation:null,
                starters:[],
                substitutes:[]
            },
            away:{
                team:{
                    name:teams[1]
                },
                formation:null,
                starters:[],
                substitutes:[]
            }
        };
        saved.rows.forEach(player => {
            const obj = {
                player: {
                    name: player.player_name,
                    number: player.number,
                    position: player.position,
                    starter: player.starter,
                    substitute: player.substitute
                }
            };
            if(player.team_name === teams[0]){
                if(player.starter){
                    response.home.starters.push(obj);
                }
                else{
                    response.home.substitutes.push(obj);
                }
            }
            else{
                if(player.starter){
                    response.away.starters.push(obj);
                }
                else{
                    response.away.substitutes.push(obj);
                }
            }
        });
        response.home.starters = sortPlayers(response.home.starters);
        response.home.substitutes = sortPlayers(response.home.substitutes);
        response.away.starters = sortPlayers(response.away.starters);
        response.away.substitutes = sortPlayers(response.away.substitutes);

        return res.json(response);
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            error:err.message
        });
    }
};