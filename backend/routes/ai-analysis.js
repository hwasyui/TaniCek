import express from 'express';
import {
    getAllMachinesAIPrediction,
} from '../controllers/ai-analysis.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); // penting agar :companyId bisa dibaca

router.use(authenticate);

// /companies/:companyId/machines/ai-analysis
router.get('/', getAllMachinesAIPrediction);

export default router;