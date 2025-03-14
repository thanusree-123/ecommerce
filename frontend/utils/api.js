import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-00q6.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') { // Ensure this runs only in the browser
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') { // Ensure this runs only in the browser
      const { response } = error;
      if (response && response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Authentication helper functions
export const authUtils = {
  isLoggedIn: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    if (typeof window === 'undefined') return false;
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
    if (typeof window === 'undefined') return null;
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
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

// Cart API endpoints - User-specific cart handling
export const cartAPI = {
  get: (userId) => api.get(`/cart?user_id=${userId}`),
  addItem: (userId, productId, quantity = 1) => api.post('/cart/add', { user_id: userId, product_id: productId, quantity }),
  updateItem: (userId, productId, quantity) => api.put(`/cart/update`, { user_id: userId, product_id: productId, quantity }),
  removeItem: (userId, productId) => api.post('/cart/remove', { user_id: userId, product_id: productId }),
  clear: (userId) => api.post('/cart/clear', { user_id: userId }),
  checkout: (userId, paymentInfo) => api.post('/cart/checkout', { user_id: userId, ...paymentInfo }),
};

// User authentication API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Export getCart function for direct use
export const getCart = (userId) => cartAPI.get(userId);

export default api;
