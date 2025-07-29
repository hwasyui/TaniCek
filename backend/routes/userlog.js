import express from 'express';
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

// Endpoint
router.post('/:machineId/logs', createUserLog); // POST /machines/:machineId/logs
router.get('/:machineId/logs', getUserLogsByMachine); // GET /machines/:machineId/logs
router.get('/:machineId/logs/:logId', getUserLogById); // GET specific log
router.put('/:machineId/logs/:logId', updateUserLog); // UPDATE specific log
router.delete('/:machineId/logs/:logId', deleteUserLog); // DELETE specific log

export default router;
