import express from 'express';
import {syncLeagues, getHomeLeagues, getLeagueById} from '../controllers/leagues.controllers.js';

const router = express.Router();

router.get('/home', getHomeLeagues);

router.get('/sync', syncLeagues);

router.get('/:id', getLeagueById);

export default router;