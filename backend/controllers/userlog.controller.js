import mongoose from 'mongoose';

import UserLog from '../models/userlog.model.js';
import Machine from '../models/machine.model.js';
import { fetchWeather } from '../utils/weather.js';

export const createUserLog = async (req, res) => {
  try {
    const { note } = req.body;
    const { machineId } = req.params;

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    let weather = {};
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (machine.location_lat && machine.location_lon) {
      try {
        weather = await fetchWeather(machine.location_lat, machine.location_lon, apiKey);
      } catch (weatherErr) {
        console.error('Weather fetch error:', weatherErr.message);
        weather = { description: 'Failed to fetch weather' };
      }
    } else {
      weather = { description: 'No coordinates provided' };
    }

    const log = await UserLog.create({
      machine: machineId,
      user: req.user._id,
      note,
      weather
    });

    await Machine.findByIdAndUpdate(machineId, {
      $push: { userLogs: log._id }
    });

    res.status(201).json({
      message: 'User log created successfully',
      data: log
    });
  } catch (error) {
    res.status(500).json({ message: 'Create log failed', error: error.message });
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

