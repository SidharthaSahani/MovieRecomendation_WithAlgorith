import React from 'react';
import { Link } from 'react-router-dom';
import { styles } from '../styles/styles';

function Navbar() {
  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>
        🎬 MovieHub
      </Link>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.navLink}>Home</Link>
        {/* <Link to="/admin" style={styles.navLink}>Admin</Link>  */}
      </div>
    </nav>
  );
}

export default Navbar;