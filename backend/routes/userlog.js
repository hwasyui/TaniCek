// userlog.js
import express from 'express';
import UserLog from '../models/userlog.model.js';
import Machine from '../models/machine.model.js';

const router = express.Router({ mergeParams: true });

// POST /machines/:machineId/logs
router.post('/', async (req, res) => {
  const { machineId } = req.params;
  const { user, date, note, weather } = req.body;

  if (!user || !date) {
    return res.status(400).json({ error: 'User and Date are required' });
  }

  try {
    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    const newLog = new UserLog({
      machine: machineId,
      user: req.user?._id || user,
      date,
      note,
      weather,
    });

    const savedLog = await newLog.save();

    // Tambahkan ID log ke dalam Machine.userLogs
    await Machine.findByIdAndUpdate(machineId, {
      $push: { userLogs: savedLog._id }
    });

    res.status(201).json({
      message: 'User log created successfully',
      data: savedLog
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /machines/:machineId/logs
router.get('/', async (req, res) => {
  const { machineId } = req.params;

  try {
    const logs = await UserLog.find({ machine: machineId })
      .populate('user', 'name email company')
      .sort({ date: -1 });

    res.status(200).json({
      message: 'Logs fetched successfully',
      data: logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /machines/:machineId/logs/:logId
router.get('/:logId', async (req, res) => {
  const { logId } = req.params;

  try {
    const log = await UserLog.findById(logId)
      .populate('user', 'name email company')
      .populate('machine', 'name type');

    if (!log) return res.status(404).json({ error: 'Log not found' });

    res.status(200).json({ message: 'Log fetched successfully', data: log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /machines/:machineId/logs/:logId
router.put('/:logId', async (req, res) => {
  const { logId } = req.params;
  const { user, date, note, weather } = req.body;

  try {
    const updatedLog = await UserLog.findByIdAndUpdate(
      logId,
      { user, date, note, weather },
      { new: true }
    );

    if (!updatedLog) return res.status(404).json({ error: 'Log not found' });

    res.status(200).json({
      message: 'Log updated successfully',
      data: updatedLog
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /machines/:machineId/logs/:logId
router.delete('/:logId', async (req, res) => {
  const { machineId, logId } = req.params;

  try {
    const deleted = await UserLog.findByIdAndDelete(logId);
    if (!deleted) return res.status(404).json({ error: 'Log not found' });

    // Hapus referensi dari Machine.userLogs
    await Machine.findByIdAndUpdate(machineId, {
      $pull: { userLogs: logId }
    });

    res.status(200).json({ message: 'Log deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
