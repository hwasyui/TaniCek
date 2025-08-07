import express from 'express';
import {
    getAllMachinesAIPrediction,
    getAllMachinesbyCompanyIdAIPrediction
} from '../controllers/ai-analysis.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); 

router.use(authenticate);

// /companies/:companyId/machines/ai-analysis
router.get('/', getAllMachinesbyCompanyIdAIPrediction);

export default router;