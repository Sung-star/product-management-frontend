import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from './Toast';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Vui lòng nhập tên đăng nhập!');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Vui lòng nhập email!');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ!');
      return false;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu!');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await authService.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName || formData.username,
        role: 'CLIENT'
      });
      
      if (result.success) {
        addToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        navigate('/login');
      } else {
        setError(result.message);
        addToast(result.message, 'error');
      }
    } catch (err) {
      const errorMsg = 'Đã xảy ra lỗi. Vui lòng thử lại!';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div className="logo-container">
            <div className="logo-icon">📝</div>
            <h1>Đăng ký tài khoản</h1>
          </div>
          <p className="register-subtitle">Tạo tài khoản mới để bắt đầu mua sắm</p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form">
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
              placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
              autoComplete="username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập địa chỉ email"
              autoComplete="email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fullName">
              <span className="label-icon">✍️</span>
              Họ và tên (Tùy chọn)
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              autoComplete="name"
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
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                autoComplete="new-password"
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="label-icon">🔐</span>
              Xác nhận mật khẩu
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang đăng ký...
              </>
            ) : (
              <>
                <span>Đăng ký</span>
                <span className="btn-icon">→</span>
              </>
            )}
          </button>
        </form>
        
        <div className="register-footer">
          <p>Đã có tài khoản?</p>
          <Link to="/login" className="link-login">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;