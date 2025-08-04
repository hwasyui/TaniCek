import { analyzeAllMachines } from '../utils/aiAnalyzer.js';
import Machine from '../models/machine.model.js';
import aiAnalysisModel from '../models/aiAnalysis.model.js';

export const getAllMachinesAIPrediction = async (req, res) => {
  try {
    const allAnalysis = await aiAnalysisModel.find()
      .populate('aiAnalysis.machine_id'); 

    return res.json(allAnalysis);
  } catch (error) {
    console.error("Fetching all AI analysis failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};