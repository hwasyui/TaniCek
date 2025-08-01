import { Router } from 'express';
import {
  createUserLog,
  getUserLogsByMachine,
  getUserLogById,
  updateUserLog,
  deleteUserLog
} from '../controllers/userlog.controller.js';

import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true }); // ini penting

router.use(authenticate);

// POST /machines/:machinesId/logs
router.post('/', createUserLog);

// GET /machines/:machinesId/logs
router.get('/', getUserLogsByMachine);

// GET /machines/:machinesId/logs/:logId
router.get('/:logId', getUserLogById);

// PUT /machines/:machinesId/logs/:logId
router.put('/:logId', updateUserLog);

// DELETE /machines/:machinesId/logs/:logId
router.delete('/:logId', deleteUserLog);

export default router;
