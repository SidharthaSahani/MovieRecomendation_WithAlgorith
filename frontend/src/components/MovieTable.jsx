import React from 'react';
import { styles } from '../styles/styles';

function MovieTable({ movies, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.adminTable}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Genre</th>
            <th style={styles.th}>Year</th>
            <th style={styles.th}>Rating</th>
            <th style={styles.th}>Director</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie._id}>
              <td style={styles.td}>
                {movie.imageUrl ? (
                  <img src={movie.imageUrl} alt={movie.title} style={styles.tableImage} />
                ) : (
                  <div style={{ 
                    ...styles.tableImage, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: '#2a2a4a' 
                  }}>
                    🎬
                  </div>
                )}
              </td>
              <td style={styles.td}>{movie.title}</td>
              <td style={styles.td}>
                <span style={styles.genreBadge}>{movie.genre}</span>
              </td>
              <td style={styles.td}>{movie.releaseYear}</td>
              <td style={styles.td}>⭐ {movie.rating.toFixed(1)}</td>
              <td style={styles.td}>{movie.director}</td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.actionButton, ...styles.editButton }}
                  onClick={() => onEdit(movie)}
                >
                  ✏️ Edit
                </button>
                <button
                  style={{ ...styles.actionButton, ...styles.deleteButton }}
                  onClick={() => onDelete(movie._id)}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MovieTable;