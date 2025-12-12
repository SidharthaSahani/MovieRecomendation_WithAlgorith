import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles/styles';

function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <div
      style={styles.movieCard}
      onClick={() => navigate(`/movie/${movie._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(233, 69, 96, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {movie.imageUrl ? (
        <img src={movie.imageUrl} alt={movie.title} style={styles.movieImage} />
      ) : (
        <div style={{ 
          ...styles.movieImage, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '48px' 
        }}>
          🎬
        </div>
      )}
      <div style={styles.movieInfo}>
        <h3 style={styles.movieTitle}>{movie.title}</h3>
        <div style={styles.movieMeta}>
          <span style={styles.genreBadge}>{movie.genre}</span>
          <span style={styles.rating}>⭐ {movie.rating.toFixed(1)}</span>
        </div>
        <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
          {movie.releaseYear} • {movie.duration} min
        </p>
      </div>
    </div>
  );
}

export default MovieCard;