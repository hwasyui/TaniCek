import { Router } from "express";
import multer from "multer";
import Machine from "../models/machine.model.js";
import Company from "../models/company.model.js";
import userRouter from "./user.byCompany.js";
import MachineRouter from "./machine.js";
import aiAnalysisRouter from "./ai-analysis.js";

const router = Router();

// Set up multer for handling multipart/form-data
const upload = multer();

// POST /companies (with image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, address } = req.body;
    const image = req.file;

    const newCompany = new Company({
      name,
      address,
      image, // Store as buffer; change if using disk
    });

    const savedCompany = await newCompany.save();

    res.status(201).json({
      message: 'Company added successfully',
      data: savedCompany,
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

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: 'Companies fetched successfully',
      data: companies,
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

    res.status(200).json({
      message: 'Company fetched successfully',
      data: company,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nested user routes for each company
router.use('/:companyId/user', userRouter);
// GET /companies/:companyId/machines
router.use('/:companyId/machines', MachineRouter);

router.use('/:companyId/ai-analysis', aiAnalysisRouter);

export default router;
