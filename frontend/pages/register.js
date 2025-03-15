'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../utils/api';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    // Email validation - must be @gmail.com
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email must be a valid Gmail address';
    }
    
    // Mobile validation - must be 10 digits
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    
    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear the specific error when field is edited
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    
    // Validate the form
    if (!validateForm()) {
      return;
    }

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setErrors({ general: response.data.error });
      }
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.error || 'Registration failed' 
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundImage}></div>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>
          
          {errors.general && <div className={styles.error}>{errors.general}</div>}
          {success && <div className={styles.success}>{success}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
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
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username"
                name="username" 
                placeholder="Enter your username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
              />
              {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="Enter your Gmail address" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="mobile">Mobile Number</label>
              <input 
                type="tel" 
                id="mobile"
                name="mobile" 
                placeholder="Enter your 10-digit mobile number" 
                value={formData.mobile} 
                onChange={handleChange} 
                required 
              />
              {errors.mobile && <span className={styles.fieldError}>{errors.mobile}</span>}
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                name="password" 
                placeholder="Create a password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Register
            </button>
            
            <div className={styles.loginLink}>
              Already have an account? <a href="/login">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
