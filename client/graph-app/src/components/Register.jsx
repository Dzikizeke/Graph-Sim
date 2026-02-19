import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../simulationAPI';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Username validation regex (alphanumeric, underscores, 3-20 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

  // Check username availability with real API
  const checkUsernameAvailability = async (username) => {
    setIsCheckingUsername(true);
    try {
      const response = await authAPI.checkUsername(username);
      return response.data.available;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleChange = async (e) => {
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

    // Check username availability in real-time
    if (name === 'username' && value.length >= 3) {
      if (!usernameRegex.test(value)) {
        setErrors(prev => ({
          ...prev,
          username: 'Username can only contain letters, numbers, and underscores (3-20 characters)'
        }));
        return;
      }

      // Simple debounce for username check
      clearTimeout(window.usernameTimeout);
      window.usernameTimeout = setTimeout(async () => {
        const isAvailable = await checkUsernameAvailability(value);
        if (!isAvailable) {
          setErrors(prev => ({
            ...prev,
            username: 'This username is already taken'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            username: ''
          }));
        }
      }, 500);
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscores only)';
    } else {
      // Check username availability on final validation
      const isAvailable = await checkUsernameAvailability(formData.username);
      if (!isAvailable) {
        newErrors.username = 'This username is already taken';
      }
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        confirm_password: formData.confirmPassword
      };

      const result = await authAPI.register(registrationData);
      
      if (result.status === 'success') {
        alert(`Welcome ${formData.username}! Your account has been created successfully.`);
        navigate('/trigonometry'); // Redirect to main app
      } else {
        setErrors({ submit: result.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Google OAuth would go here
    setIsLoading(true);
    setTimeout(() => {
      alert('Google sign up would be implemented here');
      setIsLoading(false);
    }, 1000);
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
              type="button"
            >
              ← Back to Home
            </button>
            <div className="auth-brand">
              <span className="brand-icon">📊</span>
              <h2>Create Your Account</h2>
            </div>
            <p className="auth-subtitle">
              Join thousands of math enthusiasts exploring beautiful visualizations
            </p>
          </div>

          {/* Google Sign Up */}
          <div className="social-auth-section">
            <button 
              className="google-auth-btn"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              type="button"
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
            
            <div className="divider">
              <span>or continue with email</span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form className="auth-form" onSubmit={handleEmailSignUp}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">
                Username *
                {formData.username && !errors.username && !isCheckingUsername && (
                  <span className="success-indicator">✓ Available</span>
                )}
                {isCheckingUsername && (
                  <span className="checking-indicator">Checking...</span>
                )}
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : formData.username && !errors.username && !isCheckingUsername ? 'success' : ''}
                placeholder="Choose a unique username"
                disabled={isLoading}
                maxLength="20"
              />
              <div className="input-help">
                This will be your unique identifier for saving simulations. 3-20 characters (letters, numbers, underscores)
              </div>
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a password"
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                I agree to the <a href="#terms" className="link">Terms of Service</a> and <a href="#privacy" className="link">Privacy Policy</a> *
              </label>
              {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;