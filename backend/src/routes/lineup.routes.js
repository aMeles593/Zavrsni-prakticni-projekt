import express from 'express';

import {getLineups} from '../controllers/lineup.controllers.js';

const router=express.Router();

router.get('/matches/:id/lineups',getLineups);

export default router;