import { Router } from "express";
import multer from "multer";
import Machine from "../models/machine.model.js";
import Company from "../models/company.model.js";
import userRouter from "./user.byCompany.js";
import MachineRouter from "./machine.js";
import aiAnalysisRouter from "./ai-analysis.js";

const router = Router();

const upload = multer();

// POST /companies (with image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, address } = req.body;
    let imageBuffer = undefined;
    if (req.file && req.file.buffer) {
      imageBuffer = req.file.buffer;
    }
    const newCompany = new Company({
      name,
      address,
      ...(imageBuffer && { image: imageBuffer })
    });
    const savedCompany = await newCompany.save();
    const responseCompany = savedCompany.toObject();
    if (responseCompany.image) {
      responseCompany.image = { data: responseCompany.image.toString('base64') };
    }
    res.status(201).json({
      message: 'Company added successfully',
      data: responseCompany,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /companies
router.get('/', async (req, res) => {
  const { keyword, page = 1, pageSize = 10 } = req.query;

  const limit = Math.max(1, parseInt(pageSize, 10));
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;

  const filter = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { address: { $regex: keyword, $options: 'i' } },
        ],
      }
    : {};

  try {
    const [companies, total] = await Promise.all([
      Company.find(filter).skip(skip).limit(limit).populate('machines'),
      Company.countDocuments(filter),
    ]);
    // Convert image buffer to base64 for frontend
    const companiesSafe = companies.map(c => {
      const obj = c.toObject();
      if (obj.image) {
        obj.image = { data: obj.image.toString('base64') };
      }
      return obj;
    });
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      message: 'Companies fetched successfully',
      data: companiesSafe,
      total,
      totalPages,
      page: parseInt(page),
      pageSize: limit,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /companies/:companyId
router.get('/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId).populate("machines");

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const companyObj = company.toObject();
    if (companyObj.image) {
      companyObj.image = { data: companyObj.image.toString('base64') };
    }
    res.status(200).json({
      message: 'Company fetched successfully',
      data: companyObj,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /companies/:companyId (with image)
router.put('/:companyId', upload.single('image'), async (req, res) => {
  const { companyId } = req.params;
  const { name, address } = req.body;
  let imageBuffer = undefined;
  if (req.file && req.file.buffer) {
    imageBuffer = req.file.buffer;
  }
  try {
    const updateFields = {
      name,
      address,
      ...(imageBuffer && { image: imageBuffer }),
    };
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      updateFields,
      { new: true, runValidators: true }
    );
    if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });
    const responseCompany = updatedCompany.toObject();
    if (responseCompany.image) {
      responseCompany.image = { data: responseCompany.image.toString('base64') };
    }
    res.status(200).json({
      message: 'Company updated successfully',
      data: responseCompany,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /companies/:companyId
router.delete('/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const deletedCompany = await Company.findByIdAndDelete(companyId);

    if (!deletedCompany) return res.status(404).json({ error: 'Company not found' });

    const responseCompany = deletedCompany ? deletedCompany.toObject() : null;
    if (responseCompany && responseCompany.image) {
      responseCompany.image = { data: responseCompany.image.toString('base64') };
    }
    res.status(200).json({
      message: 'Company deleted successfully',
      data: responseCompany,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nested user routes for each company
router.use('/:companyId/user', userRouter);
// GET /companies/:companyId/machines
router.use('/:companyId/machines', MachineRouter);


// GET /companies/:companyId/userlogs
import UserLog from '../models/userlog.model.js';
// import Machine from '../models/machine.model.js';
router.get('/:companyId/userlogs', async (req, res) => {
  try {
    const { companyId } = req.params;
    // Find all machines for this company
    const machines = await Machine.find({ company: companyId }).select('_id');
    const machineIds = machines.map(m => m._id);

    // Find all user logs for these machines, newest first
    const logs = await UserLog.find({ machine: { $in: machineIds } }).sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use('/:companyId/ai-analysis', aiAnalysisRouter);

export default router;
