import express from 'express';
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine
} from '../controllers/machine.controller.js';

import userlogRouter from "./userlog.js";
import machineAIAnalysisRouter from './machineAiAnalysis.js';
import aiAnalysisRouter from './ai-analysis.js';

import { getAllMachinesAIPrediction } from '../controllers/ai-analysis.controller.js';

import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';


const router = express.Router({ mergeParams: true }); // penting agar :companyId bisa dibaca

router.use(authenticate);

// /companies/:companyId/machines
router.route('/')
  .post(isAdmin, createMachine)
  .get(getAllMachines);

router.use('/ai-analysis', aiAnalysisRouter);

// /companies/:companyId/machines/:machinesId
router.route('/:machineId')
  .get(getMachineById)
  .put(isAdmin, updateMachine)
  .delete(isAdmin, deleteMachine);

// Nested logs route
router.use('/:machineId/logs', userlogRouter);

// Nested AI analysis route
router.use('/:machineId/ai-analysis', machineAIAnalysisRouter);




export default router;
