const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can add reviews' });
    }

    const { movie, comment } = req.body;
    const trimmedComment = comment?.trim();

    if (!movie || !trimmedComment) {
      return res.status(400).json({ message: 'Movie and comment are required' });
    }

    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const existingReview = await Review.findOne({ user: req.user.id, movie });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    const review = await Review.create({
      user: req.user.id,
      movie,
      comment: trimmedComment,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username')
      .select('user comment createdAt');

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    res.status(500).json({ message: 'Failed to add review' });
  }
});

router.get('/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'username')
      .select('user comment createdAt')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

module.exports = router;
