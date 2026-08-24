import db from '../db/db.js';
import {fetchLiveFixtures, fetchMatchEvents, saveEventsToDB} from '../services/apiFootball.js';
import { getExploreLeagues } from '../services/leagues.js';
import broadcaster from '../lib/broadcast.js';

const INTERVAL = 30000; 

export const startMatchWorker = ()=>{
    console.log(
        "MATCH WORKER STARTED"
    );

    setInterval(async()=>{
        try{
            console.log(
                "WORKER CHECK"
            );
            const liveFixtures = await fetchLiveFixtures();
            const liveIds = liveFixtures.map(f => f.fixture.id);
            
            const endedRes = await db.query(
                `
                SELECT api_match_id
                FROM matches
                WHERE status IN ('1H','2H','HT','ET','P','LIVE')
                AND (
                api_match_id IS NULL
                OR NOT (api_match_id = ANY($1))
                )
                `,
                [liveIds]
            );

            const endedMatches = endedRes.rows.map(r => r.api_match_id);

            if (endedMatches.length > 0) {
                await db.query(
                    `
                    UPDATE matches
                    SET
                        status='FT',
                        live_minute=NULL
                    WHERE api_match_id = ANY($1)
                    `,
                    [endedMatches]
                );

                for (const mid of endedMatches) {
                    broadcaster.emit('broadcast', 'match_ended', { matchId: mid });
                }
            }

            console.log(
                "TOTAL LIVE FROM API:",
                liveFixtures.length
            );

            let matches = [];
            try {
                const exploreLeagues = await getExploreLeagues();
                const allowed = (exploreLeagues || []).map(x => Number(x.api_id)).filter(Boolean);
                if (allowed.length > 0) {
                    matches = liveFixtures.filter(item => allowed.includes(item.league.id));
                } else {
                    console.warn('No explore leagues found, worker will not track live matches.');
                }
            } 
            catch (e) {
                console.error('Failed to load explored leagues for live tracking:', e.message || e);
            }

            console.log(
                "TRACKED LIVE:",
                matches.length
            );


            for(const item of matches){

                const fixture = item.fixture;
                if(!fixture?.id){
                    console.warn(
                        "Skipping fixture without API id"
                    );
                    continue;
                }

                const teams = item.teams;
                const goals = item.goals;

                console.log(
                    "SYNC:",
                    teams.home.name,
                    "-",
                    teams.away.name
                );


                const result = await db.query(
                `
                INSERT INTO matches
                (
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
                    live_minute
                )

                VALUES
                (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
                )

                ON CONFLICT(api_match_id)

                DO UPDATE SET

                    score_home = EXCLUDED.score_home,
                    score_away = EXCLUDED.score_away,
                    status = EXCLUDED.status,
                    live_minute = EXCLUDED.live_minute,
                    home_logo = EXCLUDED.home_logo,
                    away_logo = EXCLUDED.away_logo

                RETURNING id, api_match_id

                `,
                [
                    fixture.id,

                    item.league.id,

                    new Date().getFullYear(),

                    teams.home.name,

                    teams.away.name,

                    teams.home.logo,

                    teams.away.logo,

                    goals.home ?? 0,

                    goals.away ?? 0,
                    
                    (function(){
                        try{
                            return new Date(fixture.date).toISOString();
                        }catch(e){
                            return fixture.date;
                        }
                    })(),

                    fixture.status.short,
                    fixture.status.elapsed
                ]);
                
                const dbMatchId = result.rows?.[0]?.id ?? null;
            const apiMatchId = result.rows?.[0]?.api_match_id ?? fixture.id;

            if(!dbMatchId){
                console.warn(
                    'Warning: INSERT returned no local id for api_match_id',
                    fixture.id
                );
            }
                
            broadcaster.emit('broadcast', 'match_update', {
                matchId: fixture.id,
                score_home: goals.home ?? 0,
                score_away: goals.away ?? 0,
                status: fixture.status.short,
                live_minute: fixture.status.elapsed
            });

            const events = await fetchMatchEvents(
                fixture.id
            );

            console.log(
                "EVENTS:",
                events.length
            );

            await saveEventsToDB(
                fixture.id,
                events,
                fixture.id
            );
            }
        }
        catch(err){
            console.error(
                "WORKER ERROR:",
                err
            );
        }
    },INTERVAL);
};