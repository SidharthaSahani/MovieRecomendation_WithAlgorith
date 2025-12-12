import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../constants';
import { styles } from '../styles/styles';

function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      if (response.data.token) {
        login(response.data.token);
        toast.success('Login successful!');
        navigate('/admin');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.loginBox}>
        <div style={loginStyles.logoSection}>
          <span style={loginStyles.logo}>🎬</span>
          <h1 style={loginStyles.title}>Admin Login</h1>
          <p style={loginStyles.subtitle}>Sign in to manage movies</p>
        </div>

        <form onSubmit={handleSubmit} style={loginStyles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              width: '100%',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={loginStyles.footer}>
          <button
            onClick={() => navigate('/')}
            style={loginStyles.backButton}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(233, 69, 96, 0.1) 0%, rgba(22, 33, 62, 0.5) 100%)',
  },
  loginBox: {
    background: 'rgba(26, 26, 46, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '450px',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '15px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px',
    background: 'linear-gradient(90deg, #e94560, #ff6b6b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center',
  },
  backButton: {
    background: 'transparent',
    color: '#e94560',
    border: 'none',
    padding: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

export default LoginPage;