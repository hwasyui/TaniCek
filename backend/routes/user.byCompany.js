import { Router } from "express";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import multer from 'multer';

const upload = multer();
const router = Router({ mergeParams: true });

// POST /companies/:companyId/user
router.post('/', upload.single('image'), async (req, res) => {
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);
    // console.log("PARAMS:", req.params);
  try {
    const { email, name, password, isAdmin, isDeveloper, socialId } = req.body;
    const company_id = req.params.companyId;
    const image = req.file?.buffer;

    // Validate required fields
    if (!email || !name || !password || !company_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if company exists
    const companyExists = await Company.findById(company_id);
    if (!companyExists) {
      return res.status(400).json({ error: 'Invalid company_id' });
    }

    const newUser = new User({
      email,
      name,
      password,
      isAdmin: isAdmin || false,
      isDeveloper: isDeveloper || false,
      company_id,
      socialId: socialId || null,
      image, 
    });
    

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      data: savedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /companies/:companyId/user
router.get('/', async (req, res) => {
  const { keyword, page = 1, pageSize = 10 } = req.query;

  const limit = Math.max(1, parseInt(pageSize));
  const skip = (Math.max(1, parseInt(page)) - 1) * limit;

  const filter = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).populate("company_id"),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: 'Users fetched successfully',
      data: users,
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

// GET /companies/:companyId/user/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
      message: 'User fetched successfully',
      data: user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /companies/:companyId/user/:userId
router.put('/:userId', upload.single('image'), async (req, res) => {
  const { email, name, password, isAdmin, isDeveloper, socialId } = req.body;
  const company_id = req.params.companyId;
  const image = req.file;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        email,
        name,
        password,
        isAdmin,
        isDeveloper,
        company_id,
        socialId,
        ...(image && { image: image.buffer }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /companies/:companyId/user/:userId
router.delete('/:userId', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
