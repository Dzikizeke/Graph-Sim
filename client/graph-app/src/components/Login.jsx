import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../simulationAPI';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Username/Email validation
    if (!formData.username) {
      newErrors.username = 'Username or email is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

// In Login.jsx - update the handleEmailLogin function:
const handleEmailLogin = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsLoading(true);
  try {
    const loginData = {
      username: formData.username,
      password: formData.password
    };

    const result = await authAPI.login(loginData);
    
    if (result.status === 'success') {
      alert(`Welcome back! Successfully logged in.`);
      navigate('/'); // Redirect to main app
    } else {
      setErrors({ submit: result.message || 'Login failed. Please try again.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 
                        'Invalid username/email or password. Please try again.';
    setErrors({ submit: errorMessage });
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleLogin = () => {
    // Simulate Google OAuth - replace with your actual Google OAuth implementation
    setIsLoading(true);
    setTimeout(() => {
      console.log('Google login initiated');
      // In real app, this would redirect to Google OAuth
      alert('Google login would redirect to Google OAuth');
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    alert('Forgot password functionality would go here');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <button 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
            <div className="auth-brand">
              <span className="brand-icon">📊</span>
              <h2>Welcome Back</h2>
            </div>
            <p className="auth-subtitle">
              Sign in to continue your mathematical journey
            </p>
          </div>

          {/* Google Login */}
          <div className="social-auth-section">
            <button 
              className="google-auth-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            
            <div className="divider">
              <span>or continue with email</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form className="auth-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="username">Username or Email *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Enter your username or email"
                disabled={isLoading}
                autoComplete="username"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {errors.submit && (
              <div className="error-banner">
                {errors.submit}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create one here
              </Link>
            </p>
          </div>

          {/* Demo Credentials (remove in production) */}
          <div className="demo-credentials">
            <h4>Demo Credentials (for testing):</h4>
            <p><strong>Username:</strong> mathlover</p>
            <p><strong>Password:</strong> Demo123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;