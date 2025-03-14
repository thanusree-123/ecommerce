'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, authUtils } from '../utils/api';
import styles from './Register.module.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        setSuccess('Login successful! Redirecting...');
        router.push('/'); // Redirect immediately
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h2>Welcome Back</h2>
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
