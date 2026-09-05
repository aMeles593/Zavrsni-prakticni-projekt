import express from 'express';

import { getPlayer } from '../controllers/player.controllers.js';

const router = express.Router();

router.get('/players/:id', getPlayer);

export default router;