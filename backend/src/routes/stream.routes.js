import express from 'express';
import broadcaster from '../lib/broadcast.js';

const router = express.Router();

router.get('/stream', (req, res) => {

  const matchId = req.query.matchId ? Number(req.query.matchId) : null;

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  res.flushHeaders?.();

  const send = (event, data) => {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('Error sending SSE:', err);
    }
  };

  const handler = (type, payload) => {
    if (matchId && payload?.matchId && Number(payload.matchId) !== matchId) {
      return;
    }
    send(type, payload);
  };

  const listener = (type, payload) => handler(type, payload);
  broadcaster.on('broadcast', listener);

  const ping = setInterval(() => {
    send('ping', { ts: Date.now() });
  }, 20000);

  req.on('close', () => {
    clearInterval(ping);
    broadcaster.removeListener('broadcast', listener);
  });

});

export default router;
