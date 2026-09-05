import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startMatchWorker } from './workers/matchWorker.js';

import leaguesRoutes from './routes/leagues.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import matchDetailsRoutes from './routes/matchDetails.routes.js';
import lineupRoutes from './routes/lineup.routes.js';
import streamRoutes from './routes/stream.routes.js';
import syncRoutes from './routes/sync.routes.js';
import playerRoutes from './routes/player.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/leagues', leaguesRoutes);
app.use('/api/', matchesRoutes);
app.use('/api', matchDetailsRoutes);
app.use('/api',lineupRoutes);
app.use('/api', streamRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api', playerRoutes);

app.listen(process.env.PORT, () => {

  console.log(
    `Server running on port ${process.env.PORT}`
  );

  startMatchWorker();

});

