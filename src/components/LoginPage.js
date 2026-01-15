// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import '../styles/LoginPage.css';

// const LoginPage = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     setTimeout(() => {
//       const result = login(formData.username, formData.password);
      
//       if (result.success) {
//         navigate(result.user.role === 'ADMIN' ? '/admin' : '/');
//       } else {
//         setError(result.message);
//       }
//       setLoading(false);
//     }, 500);
//   };

//   const quickLogin = (username, password) => {
//     const result = login(username, password);
//     if (result.success) {
//       navigate(result.user.role === 'ADMIN' ? '/admin' : '/');
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-background">
//         <div className="login-shape"></div>
//         <div className="login-shape"></div>
//       </div>

//       <div className="login-card">
//         <div className="login-header">
//           <h1>🛍️ Product Manager</h1>
//           <p>Đăng nhập vào hệ thống</p>
//         </div>

//         <form onSubmit={handleSubmit} className="login-form">
//           {error && <div className="login-error">{error}</div>}

//           <div className="form-input-group">
//             <label>👤 Tên đăng nhập</label>
//             <input
//               type="text"
//               placeholder="Nhập tên đăng nhập"
//               value={formData.username}
//               onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-input-group">
//             <label>🔒 Mật khẩu</label>
//             <input
//               type="password"
//               placeholder="Nhập mật khẩu"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               required
//             />
//           </div>

//           <button type="submit" className="btn-login" disabled={loading}>
//             {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
//           </button>
//         </form>

//         <div className="quick-login">
//           <p>Đăng nhập nhanh:</p>
//           <div className="quick-login-buttons">
//             <button onClick={() => quickLogin('admin', 'admin123')} className="quick-btn admin">
//               👨‍💼 Admin
//             </button>
//             <button onClick={() => quickLogin('client', 'client123')} className="quick-btn client">
//               👤 Client
//             </button>
//           </div>
//         </div>

//         <div className="login-info">
//           <p><strong>Tài khoản demo:</strong></p>
//           <p>Admin: admin / admin123</p>
//           <p>Client: client / client123</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.login(formData.username, formData.password);
      
      if (result.success) {
        login(result.user);
        
        // Redirect dựa trên role
        if (result.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon">🎵</div>
            <h1>Product Manager</h1>
          </div>
          <p className="login-subtitle">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Mật khẩu
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang đăng nhập...
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <span className="btn-icon">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Chưa có tài khoản?</p>
          <Link to="/register" className="link-register">
            Đăng ký ngay
          </Link>
        </div>

        <div className="demo-accounts">
          <p className="demo-title">Demo Accounts:</p>
          <div className="demo-list">
            <div className="demo-item">
              <span className="demo-label">Admin:</span>
              <code>admin / admin123</code>
            </div>
            <div className="demo-item">
              <span className="demo-label">Client:</span>
              <code>client / client123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;