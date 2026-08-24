import db from '../db/db.js';
import { fetchMatchEvents, saveEventsToDB } from '../services/apiFootball.js';


export const getMatchDetails = async (req,res)=>{
    try {
        const apiMatchId = req.params.id;

        const existing = await db.query(
            `
            SELECT *
            FROM match_events
            WHERE match_id = $1
            ORDER BY minute ASC
            `,
            [
                apiMatchId
            ]
        );
        if(existing.rows.length > 0){
            return res.json({
                source:"database",
                events: existing.rows
            });
        }

        const apiEvents =
        await fetchMatchEvents(apiMatchId);

        if(apiEvents.length > 0){
            await saveEventsToDB(
                apiMatchId,
                apiEvents,
                apiMatchId
            );
        }

        const saved = await db.query(
            `
            SELECT *
            FROM match_events
            WHERE match_id = $1
            ORDER BY minute ASC
            `,
            [
                apiMatchId
            ]
        );
        res.json({
            source:"api",
            events:saved.rows
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            error:err.message
        });
    }
};
