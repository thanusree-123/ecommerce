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
// Updated cartAPI object for utils/api.js
export const cartAPI = {
  get: () => {
    const userId = getUserIdFromLocalStorage();
    return api.get(`/cart?user_id=${userId}`);
  },
  addItem: (productId) => {
    const userId = getUserIdFromLocalStorage();
    return api.post('/cart/add', { product_id: productId, user_id: userId });
  },
  removeItem: (productId) => {
    const userId = getUserIdFromLocalStorage();
    return api.post('/cart/remove', { product_id: productId, user_id: userId });
  },
  clear: () => {
    const userId = getUserIdFromLocalStorage();
    return api.post('/cart/clear', { user_id: userId });
  },
  checkout: (paymentInfo) => api.post('/cart/checkout', paymentInfo),
};

// Helper function to get user ID
// Helper function to get user ID (should return email)
function getUserIdFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.email; // Return email instead of _id
    }
  }
  return null;
}

// User authentication API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Export getCart function for direct use
export const getCart = () => cartAPI.get();

export default api;