import { Router } from "express";
const router = Router();
import Machine from "../models/machine.model.js";
import Company from "../models/company.model.js"; // Needed for DELETE route
// import reviewRouter from './review.js';

// POST /movie
router.post('/', async (req, res) => {
  try {
    const { title, posterURL, content, year, director, genres } = req.body;

    const newMovie = new Movie({
      title,
      posterURL,
      content,
      year,
      director,
      genres: genres || [], // default to empty array if not provided
    });

    const savedMovie = await newMovie.save();

    res.status(201).json({
      message: 'Movie added successfully',
      data: savedMovie,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /movie
router.get('/', async (req, res) => {
  const { keyword, page = 1, pageSize = 10 } = req.query;

  const limit = Math.max(1, parseInt(pageSize, 10));
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;

  const filter = keyword
    ? {
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { content: { $regex: keyword, $options: 'i' } },
          { genres: { $regex: keyword, $options: 'i' } }, // Allow searching genres too
        ],
      }
    : {};

  try {
    const [movies, total] = await Promise.all([
      Movie.find(filter).skip(skip).limit(limit).populate('reviews'),
      Movie.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: 'Movies fetched successfully',
      data: movies,
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

// GET /movie/:movieId
router.get('/:movieId', async (req, res) => {
  const { movieId } = req.params;

  try {
    const movie = await Movie.findById(movieId).populate('reviews');

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
router.delete('/:movieId', async (req, res) => {
  const { movieId } = req.params;

  try {
    const deleted = await Movie.findByIdAndDelete(movieId);
    if (!deleted) return res.status(404).json({ error: 'Movie not found' });

    // Optional: delete all reviews associated with this movie
    await Review.deleteMany({ movie: movieId });

    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /movie/:movieId
router.put('/:movieId', async (req, res) => {
  const { movieId } = req.params;
  const { title, posterURL, content, year, director, genres } = req.body;

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      { title, posterURL, content, year, director, genres: genres || [] },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) return res.status(404).json({ error: 'Movie not found' });

    res.status(200).json({
      message: 'Movie updated successfully',
      data: updatedMovie,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nested review routes
router.use('/:movieId/review', reviewRouter);

export default router;