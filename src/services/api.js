import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Product API
export const productAPI = {
  getAllProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  createProductWithImages: (formData) => 
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  updateProductWithImages: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  searchProducts: (keyword) => api.get(`/products/search?keyword=${keyword}`),
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (category) => api.post('/categories', category),
  updateCategory: (id, category) => api.put(`/categories/${id}`, category),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Order API
export const orderAPI = {
  getAllOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my-orders'),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, null, {
    params: { status }
  }),
  updatePaymentStatus: (id, paymentStatus) => api.put(`/orders/${id}/payment-status`, null, {
    params: { paymentStatus }
  }),
  cancelOrder: (id) => api.delete(`/orders/${id}/cancel`),
  getOrdersByStatus: (status) => api.get(`/orders/status/${status}`),
  getTotalRevenue: () => api.get('/orders/revenue'),
};

// Statistics API
export const statisticsAPI = {
  getDashboardStats: () => api.get('/statistics/dashboard'),
  getTopSellingProducts: () => api.get('/statistics/products/top-selling'),
  getMonthlyRevenue: (month, year) => api.get('/statistics/revenue/monthly', {
    params: { month, year }
  }),
  getRevenueByDateRange: (startDate, endDate) => api.get('/statistics/revenue/range', {
    params: { startDate, endDate }
  }),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  login: (username, password) => authAPI.login(username, password),
  register: (userData) => authAPI.register(userData),
};

export default api;