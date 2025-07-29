import express from 'express';
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine
} from '../controllers/machine.controller.js';

import {
  createUserLog,
  getUserLogsByMachine,
  getUserLogById,
  updateUserLog,
  deleteUserLog
} from '../controllers/userlog.controller.js';

import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createMachine)
  .get(getAllMachines);

router.route('/:id')
  .get(getMachineById)
  .put(updateMachine)
  .delete(deleteMachine);

// Nested route: /machines/:machineId/logs
router.route('/:machineId/logs')
  .post(createUserLog)
  .get(getUserLogsByMachine);

router.route('/:machineId/logs/:logId')
  .get(getUserLogById)
  .put(updateUserLog)
  .delete(deleteUserLog);

export default router;
