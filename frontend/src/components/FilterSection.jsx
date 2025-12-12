import React from 'react';
import { styles } from '../styles/styles';
import { genres } from '../constants';

function FilterSection({ search, setSearch, selectedGenre, setSelectedGenre, sortBy, setSortBy }) {
  return (
    <div style={styles.filterSection}>
      <input
        type="text"
        placeholder="🔍 Search movies, directors..."
        style={styles.searchInput}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        style={styles.select}
        value={selectedGenre}
        onChange={(e) => setSelectedGenre(e.target.value)}
      >
        <option value="All">All Genres</option>
        {genres.map(genre => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      <select
        style={styles.select}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="latest">Latest First</option>
        <option value="rating">Highest Rated</option>
        <option value="year">Release Year</option>
        <option value="title">Title A-Z</option>
      </select>
    </div>
  );
}

export default FilterSection;