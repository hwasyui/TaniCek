import express from 'express';
import Machine from '../models/machine.model.js';

const router = express.Router();

// GET /machines/types - get all unique machine types
router.get('/types', async (req, res) => {
    try {
        const types = await Machine.distinct('type');
        res.json(types.filter(Boolean));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch machine types' });
    }
});

export default router;
