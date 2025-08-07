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

export const getAllMachinesbyCompanyIdAIPrediction = async (req, res) => {
  const companyId = req.params.companyId;

  try {
    const machines = await Machine.find({ company: companyId }).populate('company');
    
    if (!machines || machines.length === 0) {
      return res.status(404).json({ message: "No machines found for this company" });
    }

    const analysisResults = await aiAnalysisModel.find({
      'aiAnalysis.machine_id': { $in: machines.map(m => m._id) }
    }).populate('aiAnalysis.machine_id');

    return res.json(analysisResults);
  } catch (error) {
    console.error("Fetching AI analysis by company ID failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}