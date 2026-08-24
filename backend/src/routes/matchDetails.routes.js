import express from 'express';
import { getMatchDetails } from '../controllers/matchDetails.controllers.js';

const router = express.Router();

router.get('/matches/:id/details', getMatchDetails);

export default router;