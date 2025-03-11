'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../utils/api';
import styles from './Register.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
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
      const response = await authAPI.login(formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.backgroundImage}></div>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Welcome Back</h2>
            <p>Login to access your account</p>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
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
                placeholder="Enter your password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Login
            </button>
            
            <div className={styles.registerLink}>
              Don't have an account yet? <a href="/register">Register</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;