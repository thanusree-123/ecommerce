import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-00q6.onrender.com/api',
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
  
  getUserId: () => {
    const user = authUtils.getUser();
    // Extract user ID from the user object or use default_user as fallback
    return user && user._id ? user._id : 'default_user';
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  setUserData: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
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

// Cart API endpoints - properly matching backend implementation
export const cartAPI = {
  get: () => {
    // Get user ID from auth utils
    const userId = authUtils.getUserId();
    return api.get(`/cart?user_id=${userId}`);
  },
  
  addItem: (productId) => {
    const userId = authUtils.getUserId();
    return api.post('/cart/add', { 
      product_id: productId, 
      user_id: userId 
    });
  },
  
  removeItem: (productId) => {
    const userId = authUtils.getUserId();
    return api.post('/cart/remove', { 
      product_id: productId, 
      user_id: userId 
    });
  },
  
  clear: () => {
    const userId = authUtils.getUserId();
    return api.post('/cart/clear', { 
      user_id: userId 
    });
  },
  
  checkout: (paymentInfo) => {
    const userId = authUtils.getUserId();
    return api.post('/cart/checkout', {
      ...paymentInfo,
      user_id: userId
    });
  },
};

// User authentication API endpoints
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    
    // If login successful, save user data and token
    if (response.data && response.data.success) {
      const { token, ...userData } = response.data;
      authUtils.setUserData(userData, token);
    }
    
    return response;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },
};

export default api;
