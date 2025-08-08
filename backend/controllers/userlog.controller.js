import mongoose from 'mongoose';

import UserLog from '../models/userlog.model.js';
import Machine from '../models/machine.model.js';
import { fetchWeather } from '../utils/weather.js';

export const createUserLog = async (req, res) => {
  console.log('=== BACKEND DEBUG LOG START ===');
  console.log('Req Params:', req.params);
  console.log('Req Body:', req.body);
  console.log('Req User:', req.user);

  try {
    const { note, location_lat, location_lon } = req.body;
    const { machineId } = req.params;

    console.log('Note:', note);
    console.log('Machine ID:', machineId);
    console.log('Location lat/lon:', location_lat, location_lon);

    if (location_lat == null || location_lon == null) {
      return res.status(400).json({ error: 'Location coordinates are required.' });
    }

    const machine = await Machine.findById(machineId);
    console.log('Machine Found:', machine);

    if (!machine) {
      console.error('Machine not found');
      return res.status(404).json({ error: 'Machine not found' });
    }

    let weather = {};
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (location_lat && location_lon) {
      try {
        weather = await fetchWeather(location_lat, location_lon, apiKey);
        console.log('Weather fetched:', weather);
      } catch (weatherErr) {
        console.error('Weather fetch error:', weatherErr.message);
        weather = { description: 'Failed to fetch weather' };
      }
    } else {
      weather = { description: 'No coordinates provided' };
      console.log('Weather:', weather);
    }

    const log = await UserLog.create({
      machine: machineId,
      user: req.user?._id || 'NO USER',
      note,
      weather,
      location_lat,
      location_lon,
    });
    console.log('Log created:', log);

    await Machine.findByIdAndUpdate(machineId, {
      $push: { userLogs: log._id },
    });
    console.log('Machine log updated with new log ID');

    console.log('=== BACKEND DEBUG LOG END ===');
    res.status(201).json({
      message: 'User log created successfully',
      data: log,
    });
  } catch (error) {
    console.error('Backend Error:', error.message);
    res.status(500).json({ message: 'Create log failed', error: error.message });
  }
};


export const getUserLogsByMachine = async (req, res) => {
  try {
    const logs = await UserLog.find({ 
      machine: req.params.machineId,
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
    return res.status(200).json({ message: "Logs deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete log failed", error: error.message });
  }
};

