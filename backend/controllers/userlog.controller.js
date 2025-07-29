import UserLog from '../models/userlog.model.js';

export const createUserLog = async (req, res) => {
  try {
    const log = await UserLog.create({
      ...req.body,
      machine: req.params.machineId,
      user: req.userId,
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Create log failed", error: error.message });
  }
};

export const getUserLogsByMachine = async (req, res) => {
  try {
    const logs = await UserLog.find({ machine: req.params.machineId });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Fetch logs failed", error: error.message });
  }
};

export const getUserLogById = async (req, res) => {
  try {
    const log = await UserLog.findById(req.params.logId);
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: "Get log failed", error: error.message });
  }
};

export const updateUserLog = async (req, res) => {
  try {
    const updatedLog = await UserLog.findByIdAndUpdate(req.params.logId, req.body, { new: true });
    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: "Update log failed", error: error.message });
  }
};

export const deleteUserLog = async (req, res) => {
  try {
    await UserLog.findByIdAndDelete(req.params.logId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Delete log failed", error: error.message });
  }
};
