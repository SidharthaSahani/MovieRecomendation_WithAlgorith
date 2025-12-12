import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { styles } from '../styles/styles';
import { API_URL } from '../constants';
import MovieCard from '../components/MovieCard';
import LoadingState from '../components/LoadingState';

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/movies/${id}`);
      setMovie(response.data);
      
      // Fetch recommendations
      const recResponse = await axios.get(`${API_URL}/movies/recommend/${response.data.genre}`);
      setRecommendations(recResponse.data.filter(m => m._id !== id));
    } catch (error) {
      toast.error('Failed to fetch movie details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !movie) {
    return <LoadingState message="Loading movie details..." />;
  }

  return (
    <div style={styles.detailPage}>
      <Link to="/" style={styles.backButton}>← Back to Movies</Link>
      
      <div style={styles.detailContainer}>
        {movie.imageUrl ? (
          <img src={movie.imageUrl} alt={movie.title} style={styles.detailImage} />
        ) : (
          <div style={{ 
            ...styles.detailImage, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '100px', 
            background: 'linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%)' 
          }}>
            🎬
          </div>
        )}
        <div style={styles.detailInfo}>
          <h1 style={styles.detailTitle}>{movie.title}</h1>
          <div style={styles.detailMeta}>
            <span style={styles.genreBadge}>{movie.genre}</span>
            <span style={{ ...styles.metaItem, background: 'rgba(255, 215, 0, 0.2)' }}>
              ⭐ {movie.rating.toFixed(1)}
            </span>
            <span style={styles.metaItem}>{movie.releaseYear}</span>
            <span style={styles.metaItem}>🕐 {movie.duration} min</span>
          </div>
          <p style={styles.description}>{movie.description}</p>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Director:</span>
            <span style={styles.infoValue}>{movie.director}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Cast:</span>
            <span style={styles.infoValue}>{movie.cast}</span>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div style={styles.recommendSection}>
          <h2 style={styles.recommendTitle}>More {movie.genre} Movies</h2>
          <div style={styles.moviesGrid}>
            {recommendations.slice(0, 4).map(rec => (
              <MovieCard key={rec._id} movie={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetailPage;