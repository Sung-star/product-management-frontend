// // Authentication Service
// const AUTH_KEY = 'user_auth';

// // Mock users - Trong thực tế sẽ lấy từ backend
// const MOCK_USERS = [
//   { username: 'admin', password: 'admin123', role: 'ADMIN', name: 'Quản Trị Viên' },
//   { username: 'client', password: 'client123', role: 'CLIENT', name: 'Khách Hàng' },
//   { username: 'user1', password: 'user123', role: 'CLIENT', name: 'Hoài Sung' }
// ];

// export const authService = {
//   // Đăng nhập
//   login: (username, password) => {
//     const user = MOCK_USERS.find(
//       u => u.username === username && u.password === password
//     );
    
//     if (user) {
//       const authData = {
//         username: user.username,
//         role: user.role,
//         name: user.name,
//         loginTime: new Date().toISOString()
//       };
//       localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
//       return { success: true, user: authData };
//     }
    
//     return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' };
//   },

//   // Đăng xuất
//   logout: () => {
//     localStorage.removeItem(AUTH_KEY);
//   },

//   // Lấy thông tin user hiện tại
//   getCurrentUser: () => {
//     const data = localStorage.getItem(AUTH_KEY);
//     return data ? JSON.parse(data) : null;
//   },

//   // Kiểm tra đã đăng nhập chưa
//   isAuthenticated: () => {
//     return localStorage.getItem(AUTH_KEY) !== null;
//   },

//   // Kiểm tra role
//   isAdmin: () => {
//     const user = authService.getCurrentUser();
//     return user && user.role === 'ADMIN';
//   },

//   isClient: () => {
//     const user = authService.getCurrentUser();
//     return user && user.role === 'CLIENT';
//   }
// };

// export default authService;

// ---------------------------------------------------------------------------

// src/services/authService.js
import { userAPI } from './api';

const AUTH_KEY = 'user_auth';
const TOKEN_KEY = 'auth_token';

export const authService = {
  /**
   * Đăng nhập với backend
   */
  login: async (username, password) => {
    try {
      const response = await userAPI.login(username, password);
      
      if (response.data.token) {
        const authData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        localStorage.setItem(TOKEN_KEY, response.data.token);
        
        return { success: true, user: authData };
      }
      
      return { success: false, message: 'Đăng nhập thất bại!' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!' 
      };
    }
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (userData) => {
    try {
      const response = await userAPI.register(userData);
      return { success: true, message: 'Đăng ký thành công!' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đăng ký thất bại!' 
      };
    }
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: () => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Lấy token
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return localStorage.getItem(AUTH_KEY) !== null;
  },

  /**
   * Kiểm tra role
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'ADMIN';
  },

  isClient: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'CLIENT';
  },

  /**
   * Cập nhật thông tin user
   */
  updateUserInfo: (userData) => {
    const currentAuth = authService.getCurrentUser();
    if (currentAuth) {
      const updatedAuth = { ...currentAuth, ...userData };
      localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth));
    }
  }
};

export default authService;