import db from '../db/db.js';
import { fetchFixturesFromAPI, fetchMatchEvents, saveEventsToDB, saveFixturesToDB } from '../services/apiFootball.js';


export const syncFixtures = async (req,res)=>{
    try{
                
        const SYNC_INTERVAL = 15 * 60 * 1000;
        const { leagueId } = req.params;
        const season = Number(req.query.season) || new Date().getFullYear();
        const syncCheck = await db.query(
        `
        SELECT last_sync
        FROM sync_status
        WHERE league_id=$1
        AND sync_type=$2
        `,
        [
            leagueId,
            `fixtures_${season}`
        ]
        );
        if(syncCheck.rows.length > 0){
            const lastSync = new Date(
                syncCheck.rows[0].last_sync
            );
            const now = new Date();
            const diff = now - lastSync;
            if(diff < SYNC_INTERVAL){
                console.log(
                    "SYNC SKIPPED - LAST SYNC:",
                    lastSync
                );
                return res.json({
                    success:true,
                    skipped:true,
                    reason:"recent sync"
                });
            }
        }

        console.log(
            "SYNC FIXTURES LEAGUE:",
            leagueId,
            "SEASON:",
            season
        );
        const fixtures = await fetchFixturesFromAPI(
            leagueId,
            season
        );
        console.log(
            "TOTAL FIXTURES:",
            fixtures.length
        );

        await saveFixturesToDB(fixtures, leagueId, db);

        const missingEvents = await db.query(
        `
        SELECT 
            m.api_match_id

        FROM matches m

        LEFT JOIN match_events e
        ON e.match_id = m.api_match_id

        WHERE 
            m.league_id = $1
            AND CAST(m.season AS TEXT) = $2
            AND m.status = 'FT'
            AND e.id IS NULL

        ORDER BY m.match_date DESC

        LIMIT 10

        `,
        [
            leagueId,
            String(season)
        ]
        );
        console.log(
            "MATCHES WITHOUT EVENTS:",
            missingEvents.rows.length
        );
        for(const match of missingEvents.rows){
            try{
                console.log(
                    "SYNC EVENTS:",
                    match.api_match_id
                );
                const events = await fetchMatchEvents(
                    match.api_match_id
                );
                console.log(
                    "EVENT COUNT:",
                    events.length
                );
                if(events.length > 0){
                    await saveEventsToDB(
                        match.api_match_id,
                        events,
                        match.api_match_id
                    );
                }
            }
            catch(err){

                console.error(
                    "EVENT SYNC ERROR:",
                    match.api_match_id,
                    err.message
                );
            }
        }

        await db.query(
        `
        INSERT INTO sync_status
        (
            league_id,
            sync_type,
            last_sync
        )

        VALUES
        (
            $1,
            $2,
            NOW()
        )

        ON CONFLICT(league_id, sync_type)

        DO UPDATE SET

        last_sync = NOW()

        `,
        [
            leagueId,
            `fixtures_${season}`
        ]
        );
            res.json({
            success:true,
            season,
            synced:fixtures.length
        });

    }
    catch(err){
        console.error(
            "SYNC FIXTURES ERROR:",
            err
        );
        res.status(500).json({
            error:err.message
        });
    }
};
