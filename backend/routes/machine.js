import express from 'express';
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
  getAllMachinesAIPrediction
} from '../controllers/machine.controller.js';

import {
  createUserLog,
  getUserLogsByMachine,
  getUserLogById,
  updateUserLog,
  deleteUserLog
} from '../controllers/userlog.controller.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); // penting agar :companyId bisa dibaca

router.use(authenticate);

// /companies/:companyId/machines
router.route('/')
  .post(createMachine)
  .get(getAllMachines);
  
router.get('/ai-analysis', getAllMachinesAIPrediction);
// /companies/:companyId/machines/:id
router.route('/:id')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

// Nested logs route
// /companies/:companyId/machines/:machineId/logs
router.route('/:machineId/logs')
  .post(createUserLog)
  .get(getUserLogsByMachine);

// /companies/:companyId/machines/:machineId/logs/:logId
router.route('/:machineId/logs/:logId')
  .get(getUserLogById)
  .put(updateUserLog)
  .delete(deleteUserLog);

export default router;
