import express from 'express';
import { authenticate } from '../middleware/auth.js';
import aiAnalysisModel from '../models/aiAnalysis.model.js';
import mongoose from 'mongoose';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// /companies/:companyId/machines/:machineId/ai-analysis
router.get('/', async (req, res) => {
  const machineId = req.params.machineId;

  try {
    const result = await aiAnalysisModel.aggregate([
      { $unwind: "$aiAnalysis" },
      { $match: { "aiAnalysis.machine_id": new mongoose.Types.ObjectId(machineId) } },
      { $project: { _id: 0, aiAnalysis: 1, createdAt: 1 } }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    return res.json(result); 
  } catch (error) {
    console.error("AI analysis for machine failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
