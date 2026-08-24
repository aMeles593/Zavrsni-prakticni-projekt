import express from 'express';
import {syncFixtures} from '../controllers/sync.controllers.js';

const router = express.Router();

router.get('/fixtures/:leagueId', syncFixtures);

export default router;