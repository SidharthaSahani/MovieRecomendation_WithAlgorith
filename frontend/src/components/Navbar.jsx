import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styles } from '../styles/styles';
import { toast } from 'react-toastify';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Hide navbar buttons on root path
  const isRootPath = location.pathname === '/';

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>
         MovieHub
      </Link>
      {!isRootPath && (
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/admin" style={styles.navLink}>Admin</Link>
              <button
                onClick={handleLogout}
                style={{
                  ...styles.navLink,
                  background: 'rgba(233, 69, 96, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={styles.navLink}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;