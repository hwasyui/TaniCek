import { Router } from "express";
import User from "../models/user.model.js";
const router = Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isDeveloper: true }).populate('company_id');
    res.status(200).json({ message: 'Developer users fetched', data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
