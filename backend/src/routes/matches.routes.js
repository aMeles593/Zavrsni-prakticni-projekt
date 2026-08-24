import express from 'express';
import { syncMatches, getFixtures, backfillRounds, updateMatches, getSeasons, getMatchById, getLiveMatches, getMatchEvents} from '../controllers/matches.controllers.js';

const router = express.Router();

router.get('/sync-matches/:leagueId', syncMatches);
router.get('/fixtures', getFixtures);
router.get('/update-matches/:leagueId/:season', updateMatches);
router.get("/matches/live", getLiveMatches);
router.get("/matches/:id/events", getMatchEvents);
router.get('/backfill-rounds/:leagueId', backfillRounds);
router.get('/seasons', getSeasons);
router.get('/matches/:id', getMatchById);

export default router;