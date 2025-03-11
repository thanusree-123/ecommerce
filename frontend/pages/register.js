'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../utils/api';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
          
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
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
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                placeholder="Enter your email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
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