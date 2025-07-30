import { analyzeAllMachines } from '../utils/aiAnalyzer.js';
import Machine from '../models/machine.model.js';
import aiAnalysisModel from '../models/aiAnalysis.model.js';


export const getAllMachinesAIPrediction = async (req, res) => {
  try {
    console.log("Token used:", process.env.GEMINI_API_KEY);
    const results = await analyzeAllMachines();
    return res.json(results);
  } catch (error) {
    console.error("AI analysis for all machines failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMachineAIPrediction = async (req, res) => {
  const machineId = req.params.machineId;

  try {
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    const analysis = await aiAnalysisModel.findOne({ machine: machineId });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    return res.json(analysis);
  } catch (error) {
    console.error("AI analysis for machine failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};