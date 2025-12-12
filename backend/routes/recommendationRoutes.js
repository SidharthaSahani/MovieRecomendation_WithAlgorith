const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

/**
 * Content-Based Filtering Algorithm (Backend Version)
 */

const WEIGHTS = {
  genre: 0.35,
  director: 0.25,
  releaseYear: 0.15,
  rating: 0.15,
  cast: 0.10,
};

function jaccardSimilarity(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
  const set1 = new Set(arr1.map(item => item.toLowerCase().trim()));
  const set2 = new Set(arr2.map(item => item.toLowerCase().trim()));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function genreSimilarity(movie1, movie2) {
  if (movie1.genre === movie2.genre) return 1.0;
  
  const relatedGenres = {
    'Action': ['Adventure', 'Thriller', 'Sci-Fi'],
    'Adventure': ['Action', 'Fantasy'],
    'Comedy': ['Romance', 'Family'],
    'Drama': ['Romance', 'Mystery'],
    'Horror': ['Thriller', 'Mystery'],
    'Sci-Fi': ['Action', 'Thriller', 'Fantasy'],
    'Fantasy': ['Adventure', 'Sci-Fi'],
    'Romance': ['Drama', 'Comedy'],
    'Thriller': ['Action', 'Horror', 'Mystery'],
    'Mystery': ['Thriller', 'Crime', 'Drama'],
    'Crime': ['Thriller', 'Mystery', 'Drama'],
  };
  
  const related = relatedGenres[movie1.genre] || [];
  if (related.includes(movie2.genre)) return 0.5;
  return 0;
}

function directorSimilarity(movie1, movie2) {
  if (!movie1.director || !movie2.director) return 0;
  const director1 = movie1.director.toLowerCase().trim();
  const director2 = movie2.director.toLowerCase().trim();
  if (director1 === director2) return 1.0;
  const lastName1 = director1.split(' ').pop();
  const lastName2 = director2.split(' ').pop();
  if (lastName1 === lastName2) return 0.3;
  return 0;
}

function yearSimilarity(movie1, movie2) {
  if (!movie1.releaseYear || !movie2.releaseYear) return 0;
  const yearDiff = Math.abs(movie1.releaseYear - movie2.releaseYear);
  if (yearDiff === 0) return 1.0;
  if (yearDiff <= 2) return 0.8;
  if (yearDiff <= 5) return 0.6;
  if (yearDiff <= 10) return 0.4;
  if (yearDiff <= 20) return 0.2;
  return 0;
}

function ratingSimilarity(movie1, movie2) {
  if (!movie1.rating || !movie2.rating) return 0;
  const ratingDiff = Math.abs(movie1.rating - movie2.rating);
  if (ratingDiff === 0) return 1.0;
  if (ratingDiff <= 0.5) return 0.9;
  if (ratingDiff <= 1.0) return 0.7;
  if (ratingDiff <= 2.0) return 0.5;
  if (ratingDiff <= 3.0) return 0.3;
  return 0;
}

function castSimilarity(movie1, movie2) {
  if (!movie1.cast || !movie2.cast) return 0;
  const cast1 = movie1.cast.split(',').map(s => s.trim());
  const cast2 = movie2.cast.split(',').map(s => s.trim());
  return jaccardSimilarity(cast1, cast2);
}

function calculateSimilarity(targetMovie, candidateMovie) {
  if (targetMovie._id.toString() === candidateMovie._id.toString()) return 0;
  
  const genreScore = genreSimilarity(targetMovie, candidateMovie);
  const directorScore = directorSimilarity(targetMovie, candidateMovie);
  const yearScore = yearSimilarity(targetMovie, candidateMovie);
  const ratingScore = ratingSimilarity(targetMovie, candidateMovie);
  const castScore = castSimilarity(targetMovie, candidateMovie);
  
  const totalScore = 
    (genreScore * WEIGHTS.genre) +
    (directorScore * WEIGHTS.director) +
    (yearScore * WEIGHTS.releaseYear) +
    (ratingScore * WEIGHTS.rating) +
    (castScore * WEIGHTS.cast);
  
  return {
    score: totalScore,
    breakdown: {
      genre: genreScore,
      director: directorScore,
      year: yearScore,
      rating: ratingScore,
      cast: castScore
    }
  };
}

// @route   GET /api/recommendations/:movieId
// @desc    Get content-based recommendations for a movie
// @access  Public
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const limit = parseInt(req.query.limit) || 6;
    
    // Get the target movie
    const targetMovie = await Movie.findById(movieId);
    if (!targetMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    // Get all other movies
    const allMovies = await Movie.find({ _id: { $ne: movieId } });
    
    // Calculate similarity scores
    const recommendations = allMovies
      .map(movie => {
        const similarity = calculateSimilarity(targetMovie, movie);
        return {
          movie: movie.toObject(),
          similarityScore: similarity.score,
          scoreBreakdown: similarity.breakdown
        };
      })
      .filter(item => item.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
    
    res.json({
      targetMovie: {
        id: targetMovie._id,
        title: targetMovie.title,
        genre: targetMovie.genre
      },
      recommendations: recommendations.map(item => ({
        ...item.movie,
        similarityScore: item.similarityScore.toFixed(3),
        scoreBreakdown: {
          genre: item.scoreBreakdown.genre.toFixed(2),
          director: item.scoreBreakdown.director.toFixed(2),
          year: item.scoreBreakdown.year.toFixed(2),
          rating: item.scoreBreakdown.rating.toFixed(2),
          cast: item.scoreBreakdown.cast.toFixed(2)
        }
      })),
      algorithm: 'content-based-filtering',
      weights: WEIGHTS
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/recommendations/similar/:movieId
// @desc    Get simple similar movies (for backward compatibility)
// @access  Public
router.get('/similar/:movieId', async (req, res) => {
  try {
    const targetMovie = await Movie.findById(req.params.movieId);
    if (!targetMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    const allMovies = await Movie.find({ _id: { $ne: req.params.movieId } });
    
    const recommendations = allMovies
      .map(movie => ({
        ...movie.toObject(),
        similarityScore: calculateSimilarity(targetMovie, movie).score
      }))
      .filter(movie => movie.similarityScore > 0)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 6);
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;