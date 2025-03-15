'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../utils/api';
import styles from './Register.module.css';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    mobile: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    // Email validation - only @gmail.com emails
    if (!formData.email.endsWith('@gmail.com')) {
      setError('Only Gmail addresses (@gmail.com) are allowed');
      return false;
    }

    // In register mode, validate additional fields
    if (isRegisterMode) {
      // Mobile validation - 10 digits only
      if (!/^\d{10}$/.test(formData.mobile)) {
        setError('Mobile number must be exactly 10 digits');
        return false;
      }

      // Name validation - must not be empty
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }

      // Username validation - must not be empty
      if (!formData.username.trim()) {
        setError('Username is required');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    // Hard-coded admin credentials check
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin' && formData.role === 'admin') {
      // Create admin user object with role
      const adminUser = {
        username: 'admin',
        email: 'admin@gmail.com',
        role: 'admin'
      };
      
      // Store admin user data and a mock token
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('token', 'admin-jwt-token-mock');
      
      setSuccess('Admin login successful! Redirecting...');
      setTimeout(() => router.push('/'), 2000);
      return;
    }

    try {
      const response = await authAPI.login(formData);
      if (response.data.success) {
        // For regular users, store token and user data
        localStorage.setItem('token', response.data.token);
        
        // Store user data including ID and role
        const userData = response.data.user || { 
          email: formData.email,
          _id: response.data.user_id, 
          role: formData.role // Use selected role
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        setSuccess('Registration successful! Please login.');
        // Switch to login mode after successful registration
        setIsRegisterMode(false);
        setFormData({
          ...formData,
          password: '' // Clear password for security
        });
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    if (isRegisterMode) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccess('');
    // Clear form when switching modes
    setFormData({
      email: '',
      password: '',
      name: '',
      username: '',
      mobile: '',
      role: 'user'
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundImage}></div>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>{isRegisterMode ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isRegisterMode ? 'Register to get started' : 'Login to access your account'}</p>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Always show email field */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email (only @gmail.com)</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="Enter your gmail address" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            {/* Always show password field */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                name="password" 
                placeholder="Enter your password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Show role dropdown for both login and register */}
            <div className={styles.inputGroup}>
              <label htmlFor="role">Account Type</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={styles.selectInput}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            {/* Additional fields only visible in register mode */}
            {isRegisterMode && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name" 
                    placeholder="Enter your full name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="username">Username</label>
                  <input 
                    type="text" 
                    id="username"
                    name="username" 
                    placeholder="Choose a username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="mobile">Mobile Number (10 digits)</label>
                  <input 
                    type="tel" 
                    id="mobile"
                    name="mobile" 
                    placeholder="Enter your 10-digit mobile number" 
                    value={formData.mobile} 
                    onChange={handleChange} 
                    pattern="[0-9]{10}"
                    required 
                  />
                </div>
              </>
            )}
            
            <button type="submit" className={styles.submitButton}>
              {isRegisterMode ? 'Register' : 'Login'}
            </button>
            
            <div className={styles.toggleModeLink}>
              {isRegisterMode ? 
                'Already have an account? ' : 
                'Don\'t have an account yet? '}
              <a href="#" onClick={(e) => {e.preventDefault(); toggleMode();}}>
                {isRegisterMode ? 'Login' : 'Register'}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
