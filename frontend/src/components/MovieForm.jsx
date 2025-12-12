import React from 'react';
import { styles } from '../styles/styles';
import { genres } from '../constants';

function MovieForm({ formData, handleInputChange, handleSubmit, handleImageChange, imagePreview, editingMovie, onCancel }) {
  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          style={styles.input}
          required
          placeholder="Enter movie title"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          style={styles.textarea}
          required
          placeholder="Enter movie description"
        />
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Genre *</label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            style={styles.select}
            required
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Release Year *</label>
          <input
            type="number"
            name="releaseYear"
            value={formData.releaseYear}
            onChange={handleInputChange}
            style={styles.input}
            required
            min="1900"
            max={new Date().getFullYear() + 5}
          />
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Rating (0-10)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            style={styles.input}
            min="0"
            max="10"
            step="0.1"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Duration (minutes) *</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            style={styles.input}
            required
            min="1"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Director *</label>
        <input
          type="text"
          name="director"
          value={formData.director}
          onChange={handleInputChange}
          style={styles.input}
          required
          placeholder="Enter director name"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Cast *</label>
        <input
          type="text"
          name="cast"
          value={formData.cast}
          onChange={handleInputChange}
          style={styles.input}
          required
          placeholder="Enter main cast (comma separated)"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Movie Poster</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.fileInput}
        />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={styles.previewImage} />
        )}
      </div>

      <div style={styles.buttonGroup}>
        <button type="button" style={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" style={styles.submitButton}>
          {editingMovie ? 'Update Movie' : 'Add Movie'}
        </button>
      </div>
    </form>
  );
}

export default MovieForm;