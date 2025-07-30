import Machine from '../models/machine.model.js';

// CREATE MACHINE
export const createMachine = async (req, res) => {
  try {
    const machine = await Machine.create({ ...req.body, company: req.params.companyId, user_id: req.user._id });
    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Create machine failed", error: error.message });
  }
};

// READ ALL MACHINES
export const getAllMachines = async (req, res) => {
  try {
    const companyId = req.params.companyId;

    const machines = await Machine.find({ company: companyId });

    res.status(200).json(machines);
  } catch (error) {
    res.status(500).json({ message: "Fetch machines failed", error: error.message });
  }
};

// READ MACHINE BY ID
export const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Get machine failed", error: error.message });
  }
};

// UPDATE MACHINE
export const updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(req.params.machineId, req.body, { new: true });
    res.status(200).json(machine);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// DELETE MACHINE
export const deleteMachine = async (req, res) => {
  try {
    const deletedMachine = await Machine.findByIdAndDelete(req.params.machineId);

    if (!deletedMachine) {
      return res.status(404).json({ message: "Machine not found" });
    }
    return res.status(200).json({ message: "Machine deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Delete failed", error: error.message });
  }
};