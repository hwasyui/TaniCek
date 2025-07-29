import Machine from '../models/machine.model.js';

export const createMachine = async (req, res) => {
  try {
    const machine = await Machine.create({ ...req.body, owner: req.user.id });
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Create machine failed", error: error.message });
  }
};

export const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ owner: req.user.id });
    res.status(200).json(machines);
  } catch (error) {
    res.status(500).json({ message: "Fetch machines failed", error: error.message });
  }
};

export const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Get machine failed", error: error.message });
  }
};

export const updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

export const deleteMachine = async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
