import { Router } from "express";
const router = Router();
import Machine from "../models/machine.model.js";
import Company from "../models/company.model.js"; // Needed for DELETE route
// import reviewRouter from './review.js';

// POST /company
router.post('/', async (req, res) => {
  try {
    const { name, address } = req.body;

    const newCompany = new Company({
      name,
      address,
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

// GET /company
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

// GET /company/:companyId
router.get('/:companyId', async (req, res) => {
  const { companyId } = req.params;

  try {
    const company = await Company.findById(companyId)

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({
      message: 'Movie fetched successfully',
      data: movie,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /movie/:movieId
// router.delete('/:movieId', async (req, res) => {
//   const { movieId } = req.params;

//   try {
//     const deleted = await Movie.findByIdAndDelete(movieId);
//     if (!deleted) return res.status(404).json({ error: 'Movie not found' });

//     // Optional: delete all reviews associated with this movie
//     await Review.deleteMany({ movie: movieId });

//     res.status(200).json({ message: 'Movie deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PUT /movie/:movieId
// router.put('/:movieId', async (req, res) => {
//   const { movieId } = req.params;
//   const { title, posterURL, content, year, director, genres } = req.body;

//   try {
//     const updatedMovie = await Movie.findByIdAndUpdate(
//       movieId,
//       { title, posterURL, content, year, director, genres: genres || [] },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMovie) return res.status(404).json({ error: 'Movie not found' });

//     res.status(200).json({
//       message: 'Movie updated successfully',
//       data: updatedMovie,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Nested review routes
// router.use('/:movieId/review', reviewRouter);

export default router;