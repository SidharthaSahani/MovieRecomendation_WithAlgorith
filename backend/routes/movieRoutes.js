const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Movie = require('../models/Movie');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// @route   GET /api/movies
// @desc    Get all movies (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { genre, sort } = req.query;
    let query = {};
    
    if (genre) {
      query.genre = genre;
    }

    let movies = await Movie.find(query);

    // Sort movies
    if (sort === 'rating') {
      movies = movies.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'year') {
      movies = movies.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sort === 'title') {
      movies = movies.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: latest first (by _id)
      movies = movies.reverse();
    }

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/movies/:id
// @desc    Get single movie by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/movies/recommend/:genre
// @desc    Get movie recommendations by genre
// @access  Public
router.get('/recommend/:genre', async (req, res) => {
  try {
    const movies = await Movie.find({ genre: req.params.genre })
      .sort({ rating: -1 })
      .limit(10);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/movies
// @desc    Create a new movie
// @access  Private (Admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const movieData = {
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    };

    const movie = new Movie(movieData);
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/movies/:id
// @desc    Update a movie
// @access  Private (Admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/movies/:id
// @desc    Delete a movie
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;