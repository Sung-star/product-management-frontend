import axios from 'axios';
const BASE_HOST = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Ghép thêm đuôi /api (vì code cũ của bạn có dùng /api)
const API_BASE_URL = `${BASE_HOST}`; 
const API_CONFIG_URL = `${BASE_HOST}/api`; 

const api = axios.create({
  baseURL: API_CONFIG_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Chỉ redirect nếu không phải là request đăng nhập
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper function để kiểm tra ID hợp lệ (tránh lỗi "undefined" gửi lên server)
const isValidId = (id) => id !== null && id !== undefined && id !== 'undefined' && id !== '';

// Authentication API
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => isValidId(id) ? api.get(`/users/${id}`) : Promise.reject("Invalid ID"),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  // Khôi phục 2 dòng bị thiếu ở đây:
  login: (username, password) => authAPI.login(username, password),
  register: (userData) => authAPI.register(userData),
};

// ✅ ADDRESS API
export const addressAPI = {
  getUserAddresses: (userId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.get(`/addresses/user/${userId}`);
  },
  createAddress: (userId, addressData) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.post(`/addresses/user/${userId}`, addressData);
  },
  updateAddress: (id, addressData) => api.put(`/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/addresses/${id}/set-default`),
};

// ✅ WISHLIST API
export const wishlistAPI = {
  getUserWishlist: (userId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.get(`/wishlist/user/${userId}`);
  },
  addToWishlist: (userId, productId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.post(`/wishlist/user/${userId}/product/${productId}`);
  },
  removeFromWishlist: (userId, productId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.delete(`/wishlist/user/${userId}/product/${productId}`);
  },
  isInWishlist: (userId, productId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.get(`/wishlist/user/${userId}/product/${productId}/check`);
  },
};

// ✅ NOTIFICATION API
export const notificationAPI = {
  getUserNotifications: (userId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.get(`/notifications/user/${userId}`);
  },
  getUnreadNotifications: (userId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.get(`/notifications/user/${userId}/unread`);
  },
  getUnreadCount: (userId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.get(`/notifications/user/${userId}/unread-count`);
  },
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    return api.put(`/notifications/user/${userId}/read-all`)
  },
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ✅ FILE UPLOAD API
export const uploadAPI = {
  uploadAvatar: (userId, file) => {
    if (!isValidId(userId)) return Promise.reject("Invalid User ID");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
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
  updateOrderStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, paymentStatus) =>
    api.put(`/orders/${id}/payment`, { paymentStatus }),
  cancelOrder: (id) => api.delete(`/orders/${id}/cancel`),
  getOrdersByStatus: (status) => api.get(`/orders/status/${status}`),
  getTotalRevenue: () => api.get('/orders/revenue'),
  verifyVnpayPayment: (params) => api.get('/payment/vnpay-return', { params }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
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

export default api;