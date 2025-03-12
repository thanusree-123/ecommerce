// frontend/utils/api.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle authentication errors
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't redirect automatically - let the component handle it
    }
    
    return Promise.reject(error);
  }
);

// Authentication helper functions
export const authUtils = {
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
  
  isAdmin: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin';
    } catch (err) {
      console.error('Error parsing user data:', err);
      return false;
    }
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (err) {
      console.error('Error parsing user data:', err);
      return null;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Product API endpoints
export const productAPI = {
  getAll: (query = '') => api.get(`/products${query}`),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  search: (term) => api.get(`/products/search?q=${term}`),
};

// Cart API endpoints - adjusted to match backend implementation
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId, quantity = 1) => api.post('/cart/add', { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.post('/cart/remove', { product_id: itemId }),
  clear: () => api.post('/cart/clear'),
  checkout: (paymentInfo) => api.post('/cart/checkout', paymentInfo),
};

// User authentication API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Export getCart function for direct use
export const getCart = () => cartAPI.get();

export default api;
