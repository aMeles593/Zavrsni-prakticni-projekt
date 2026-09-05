import { fetchPlayer } from '../services/apiFootball.js';

export const getPlayer = async (req, res) => {
    try {

        const playerId = Number(req.params.id);
        const season = Number(req.query.season);

        if (!playerId) {
            return res.status(400).json({
                error: 'Invalid player ID'
            });
        }

        if (!season) {
            return res.status(400).json({
                error: 'Season is required'
            });
        }

        const player = await fetchPlayer(
            playerId,
            season
        );

        if (!player) {
            return res.status(404).json({
                error: 'Player not found'
            });
        }

        return res.json(player);
    }
    catch(err){
        console.error(
            "GET PLAYER ERROR:",
            err
        );

        return res.status(500).json({
            error: err.message
        });
    }
};