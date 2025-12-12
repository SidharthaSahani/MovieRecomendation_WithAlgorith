const express = require('express');
const router = express.Router();
const multer = require('multer');
const Movie = require('../models/Movie');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all movies
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'year') sortOption = { releaseYear: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const movies = await Movie.find(query).sort(sortOption);
    
    // Convert image buffer to base64 for frontend
    const moviesWithImages = movies.map(movie => {
      const movieObj = movie.toObject();
      if (movie.image && movie.image.data) {
        movieObj.imageUrl = `data:${movie.image.contentType};base64,${movie.image.data.toString('base64')}`;
      }
      delete movieObj.image;
      return movieObj;
    });

    res.json(moviesWithImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single movie
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    const movieObj = movie.toObject();
    if (movie.image && movie.image.data) {
      movieObj.imageUrl = `data:${movie.image.contentType};base64,${movie.image.data.toString('base64')}`;
    }
    delete movieObj.image;
    
    res.json(movieObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get genres list
router.get('/meta/genres', async (req, res) => {
  const genres = [
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'Horror',
    'Musical',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'War',
    'Western'
  ];
  res.json(genres);
});

// Create movie (Admin)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log('Incoming request body:', req.body);
    console.log('Incoming file:', req.file);
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'genre', 'releaseYear', 'director', 'cast', 'duration'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const movieData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      genre: req.body.genre,
      releaseYear: parseInt(req.body.releaseYear),
      rating: parseFloat(req.body.rating) || 0,
      director: req.body.director.trim(),
      cast: req.body.cast.trim(),
      duration: parseInt(req.body.duration)
    };

    // Log parsed data for debugging
    console.log('Parsed movie data:', movieData);

    // Validate numeric fields
    if (isNaN(movieData.releaseYear) || movieData.releaseYear < 1900 || movieData.releaseYear > new Date().getFullYear() + 5) {
      return res.status(400).json({ message: 'Invalid release year' });
    }

    if (isNaN(movieData.duration) || movieData.duration <= 0) {
      return res.status(400).json({ message: 'Invalid duration' });
    }

    if (movieData.rating < 0 || movieData.rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 0 and 10' });
    }

    // Validate genre is in allowed list
    const allowedGenres = [
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
      'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
      'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
      'War', 'Western'
    ];
    
    if (!allowedGenres.includes(movieData.genre)) {
      return res.status(400).json({ message: `Invalid genre. Must be one of: ${allowedGenres.join(', ')}` });
    }

    if (req.file) {
      movieData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const movie = new Movie(movieData);
    const savedMovie = await movie.save();
    
    const movieObj = savedMovie.toObject();
    if (savedMovie.image && savedMovie.image.data) {
      movieObj.imageUrl = `data:${savedMovie.image.contentType};base64,${savedMovie.image.data.toString('base64')}`;
    }
    delete movieObj.image;
    
    res.status(201).json(movieObj);
  } catch (error) {
    console.error('Error creating movie:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// Update movie (Admin)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const movieData = {
      title: req.body.title,
      description: req.body.description,
      genre: req.body.genre,
      releaseYear: parseInt(req.body.releaseYear),
      rating: parseFloat(req.body.rating) || 0,
      director: req.body.director,
      cast: req.body.cast,
      duration: parseInt(req.body.duration)
    };

    if (req.file) {
      movieData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      movieData,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const movieObj = movie.toObject();
    if (movie.image && movie.image.data) {
      movieObj.imageUrl = `data:${movie.image.contentType};base64,${movie.image.data.toString('base64')}`;
    }
    delete movieObj.image;

    res.json(movieObj);
  } catch (error) {
    console.error('Error updating movie:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete movie (Admin)
router.delete('/:id', async (req, res) => {
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

// Get recommendations based on genre
router.get('/recommend/:genre', async (req, res) => {
  try {
    const movies = await Movie.find({ genre: req.params.genre })
      .sort({ rating: -1 })
      .limit(6);
    
    const moviesWithImages = movies.map(movie => {
      const movieObj = movie.toObject();
      if (movie.image && movie.image.data) {
        movieObj.imageUrl = `data:${movie.image.contentType};base64,${movie.image.data.toString('base64')}`;
      }
      delete movieObj.image;
      return movieObj;
    });

    res.json(moviesWithImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;