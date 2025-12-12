/**
 * Content-Based Filtering Recommendation Algorithm
 * Analyzes movie attributes to find similar movies
 */

// Weights for different attributes (total = 1.0)
const WEIGHTS = {
  genre: 0.35,        // Genre is most important
  director: 0.25,     // Director style matters
  releaseYear: 0.15,  // Year proximity
  rating: 0.15,       // Similar quality
  cast: 0.10,         // Cast overlap
};

/**
 * Calculate Jaccard Similarity for arrays (cast, genres, etc.)
 * Measures overlap between two sets
 */
function jaccardSimilarity(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1.map(item => item.toLowerCase().trim()));
  const set2 = new Set(arr2.map(item => item.toLowerCase().trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculate similarity score for genre
 */
function genreSimilarity(movie1, movie2) {
  // Exact match gets full score
  if (movie1.genre === movie2.genre) return 1.0;
  
  // Define related genres
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
  
  // Partial match for related genres
  const related = relatedGenres[movie1.genre] || [];
  if (related.includes(movie2.genre)) return 0.5;
  
  return 0;
}

/**
 * Calculate similarity score for director
 */
function directorSimilarity(movie1, movie2) {
  if (!movie1.director || !movie2.director) return 0;
  
  const director1 = movie1.director.toLowerCase().trim();
  const director2 = movie2.director.toLowerCase().trim();
  
  // Exact match
  if (director1 === director2) return 1.0;
  
  // Partial match (same last name)
  const lastName1 = director1.split(' ').pop();
  const lastName2 = director2.split(' ').pop();
  if (lastName1 === lastName2) return 0.3;
  
  return 0;
}

/**
 * Calculate similarity score for release year
 * Movies from similar time periods are more similar
 */
function yearSimilarity(movie1, movie2) {
  if (!movie1.releaseYear || !movie2.releaseYear) return 0;
  
  const yearDiff = Math.abs(movie1.releaseYear - movie2.releaseYear);
  
  // Same year = 1.0
  // Within 2 years = 0.8
  // Within 5 years = 0.6
  // Within 10 years = 0.4
  // Within 20 years = 0.2
  // More than 20 years = 0
  
  if (yearDiff === 0) return 1.0;
  if (yearDiff <= 2) return 0.8;
  if (yearDiff <= 5) return 0.6;
  if (yearDiff <= 10) return 0.4;
  if (yearDiff <= 20) return 0.2;
  return 0;
}

/**
 * Calculate similarity score for rating
 * Movies with similar ratings are likely to appeal to similar audiences
 */
function ratingSimilarity(movie1, movie2) {
  if (!movie1.rating || !movie2.rating) return 0;
  
  const ratingDiff = Math.abs(movie1.rating - movie2.rating);
  
  // Same rating = 1.0
  // Within 0.5 = 0.9
  // Within 1.0 = 0.7
  // Within 2.0 = 0.5
  // Within 3.0 = 0.3
  // More than 3.0 = 0
  
  if (ratingDiff === 0) return 1.0;
  if (ratingDiff <= 0.5) return 0.9;
  if (ratingDiff <= 1.0) return 0.7;
  if (ratingDiff <= 2.0) return 0.5;
  if (ratingDiff <= 3.0) return 0.3;
  return 0;
}

/**
 * Calculate similarity score for cast
 * Uses Jaccard similarity to measure actor overlap
 */
function castSimilarity(movie1, movie2) {
  if (!movie1.cast || !movie2.cast) return 0;
  
  // Split cast strings into arrays
  const cast1 = movie1.cast.split(',').map(s => s.trim());
  const cast2 = movie2.cast.split(',').map(s => s.trim());
  
  return jaccardSimilarity(cast1, cast2);
}

/**
 * Calculate overall similarity score between two movies
 * Returns a score between 0 and 1
 */
export function calculateSimilarity(targetMovie, candidateMovie) {
  // Don't compare movie with itself
  if (targetMovie._id === candidateMovie._id) return 0;
  
  const genreScore = genreSimilarity(targetMovie, candidateMovie);
  const directorScore = directorSimilarity(targetMovie, candidateMovie);
  const yearScore = yearSimilarity(targetMovie, candidateMovie);
  const ratingScore = ratingSimilarity(targetMovie, candidateMovie);
  const castScore = castSimilarity(targetMovie, candidateMovie);
  
  // Weighted sum
  const totalScore = 
    (genreScore * WEIGHTS.genre) +
    (directorScore * WEIGHTS.director) +
    (yearScore * WEIGHTS.releaseYear) +
    (ratingScore * WEIGHTS.rating) +
    (castScore * WEIGHTS.cast);
  
  return totalScore;
}

/**
 * Get movie recommendations based on content similarity
 * @param {Object} targetMovie - The movie to find recommendations for
 * @param {Array} allMovies - All available movies in the database
 * @param {Number} limit - Number of recommendations to return (default: 6)
 * @returns {Array} Array of recommended movies sorted by similarity score
 */
export function getRecommendations(targetMovie, allMovies, limit = 6) {
  // Calculate similarity scores for all movies
  const moviesWithScores = allMovies
    .filter(movie => movie._id !== targetMovie._id) // Exclude target movie
    .map(movie => ({
      ...movie,
      similarityScore: calculateSimilarity(targetMovie, movie),
      // Store individual scores for debugging
      scores: {
        genre: genreSimilarity(targetMovie, movie),
        director: directorSimilarity(targetMovie, movie),
        year: yearSimilarity(targetMovie, movie),
        rating: ratingSimilarity(targetMovie, movie),
        cast: castSimilarity(targetMovie, movie),
      }
    }))
    .filter(movie => movie.similarityScore > 0) // Only include movies with some similarity
    .sort((a, b) => b.similarityScore - a.similarityScore); // Sort by similarity score (descending)
  
  // Return top N recommendations
  return moviesWithScores.slice(0, limit);
}

/**
 * Get explanation for why a movie was recommended
 * @param {Object} scores - Individual similarity scores
 * @returns {String} Human-readable explanation
 */
export function getRecommendationReason(scores) {
  const reasons = [];
  
  if (scores.genre > 0.9) reasons.push('same genre');
  else if (scores.genre > 0.4) reasons.push('similar genre');
  
  if (scores.director > 0.9) reasons.push('same director');
  else if (scores.director > 0.2) reasons.push('similar director');
  
  if (scores.year > 0.7) reasons.push('from the same era');
  
  if (scores.rating > 0.7) reasons.push('similar rating');
  
  if (scores.cast > 0.3) reasons.push('shared cast members');
  
  if (reasons.length === 0) return 'similar characteristics';
  if (reasons.length === 1) return reasons[0];
  if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`;
  
  return `${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}`;
}

export default {
  calculateSimilarity,
  getRecommendations,
  getRecommendationReason,
  WEIGHTS
};