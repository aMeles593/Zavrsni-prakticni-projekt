import express from 'express';

import { getPlayer, getPlayerSeasons } from '../controllers/player.controllers.js';

const router = express.Router();
router.get(
    '/players/:id/seasons',
    getPlayerSeasons
);

router.get(
    '/players/:id',
    getPlayer
);

export default router;