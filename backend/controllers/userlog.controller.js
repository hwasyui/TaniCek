import UserLog from '../models/userlog.model.js';
import mongoose from 'mongoose';

export const createUserLog = async (req, res) => {
  try {
    const log = await UserLog.create({
      ...req.body,
      machine: req.params.machineId,
      user: req.user._id,
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: "Create log failed", error: error.message });
  }
};

export const getUserLogsByMachine = async (req, res) => {
  try {
    const logs = await UserLog.find({ 
      machine: req.params.machineId,
      user: req.user._id 
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Fetch logs failed", error: error.message });
  }
};

export const getUserLogById = async (req, res) => {
  try {
    const { logId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return res.status(400).json({ message: "Invalid log ID" });
    }

    const log = await UserLog.findOne({ _id: logId, user: req.user._id });
    if (!log) return res.status(404).json({ message: "Log not found or unauthorized" });

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: "Get log failed", error: error.message });
  }
};

export const updateUserLog = async (req, res) => {
  try {
    const { logId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return res.status(400).json({ message: "Invalid log ID" });
    }

    const updatedLog = await UserLog.findOneAndUpdate(
      { _id: logId, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedLog) return res.status(404).json({ message: "Log not found or unauthorized" });

    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ message: "Update log failed", error: error.message });
  }
};

export const deleteUserLog = async (req, res) => {
  try {
    const { logId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(logId)) {
      return res.status(400).json({ message: "Invalid log ID" });
    }

    const deletedLog = await UserLog.findOneAndDelete({ _id: logId, user: req.user._id });
    if (!deletedLog) return res.status(404).json({ message: "Log not found or unauthorized" });
    return res.status(200).json({ message: "Machine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete log failed", error: error.message });
  }
};
