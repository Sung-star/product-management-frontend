import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useToast } from './Toast';
import Footer from './Footer';
import '../styles/ClientProfile.css';

const ClientProfile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    fullName: user.fullName || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      addToast('❌ Vui lòng kiểm tra lại thông tin!', 'error');
      return;
    }

    try {
      setLoading(true);
      await userAPI.updateUser(user.id, formData);
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      addToast('✅ Cập nhật thông tin thành công!', 'success');
    } catch (err) {
      console.error('Update profile error:', err);
      addToast('❌ ' + (err.response?.data || 'Không thể cập nhật thông tin!'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      addToast('❌ Vui lòng kiểm tra lại thông tin!', 'error');
      return;
    }

    try {
      setLoading(true);
      // Gọi API update user với password mới
      await userAPI.updateUser(user.id, {
        password: passwordData.newPassword
      });
      
      setShowPasswordForm(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      addToast('✅ Đổi mật khẩu thành công!', 'success');
    } catch (err) {
      console.error('Change password error:', err);
      addToast('❌ ' + (err.response?.data || 'Không thể đổi mật khẩu!'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      fullName: user.fullName || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleCancelPassword = () => {
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPasswordForm(false);
  };

  return (
    <>
      <div className="client-profile">
        {/* Header */}
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Quay lại
          </button>
          <div className="header-content">
            <h1>👤 Tài Khoản Của Tôi</h1>
            <p className="header-subtitle">Quản lý thông tin cá nhân</p>
          </div>
        </div>

        <div className="profile-container">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="user-card">
              <div className="user-avatar-large">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || '👤'}
              </div>
              <h3 className="user-name">{user.fullName || user.username || 'Người dùng'}</h3>
              <p className="user-email">{user.email}</p>
              <div className="user-role">
                <span className="role-badge">
                  {user.role === 'ADMIN' ? '👑 Quản trị viên' : '👤 Khách hàng'}
                </span>
              </div>
            </div>

            <div className="menu-list">
              <button className="menu-item active">
                <span className="menu-icon">👤</span>
                <span>Thông tin cá nhân</span>
              </button>
              <button className="menu-item" onClick={() => navigate('/orders')}>
                <span className="menu-icon">📦</span>
                <span>Đơn hàng</span>
              </button>
              <button className="menu-item" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                <span className="menu-icon">🔒</span>
                <span>Đổi mật khẩu</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Profile Info Card */}
            {!showPasswordForm ? (
              <div className="profile-card">
                <div className="card-header">
                  <h2>📋 Thông tin cá nhân</h2>
                  {!isEditing && (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      ✏️ Chỉnh sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-section">
                    <div className="form-group">
                      <label>
                        <span className="label-icon">👤</span>
                        Tên đăng nhập
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        disabled
                        className="input-disabled"
                      />
                      <small className="input-hint">Tên đăng nhập không thể thay đổi</small>
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">📧</span>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={errors.email ? 'input-error' : ''}
                        placeholder="example@email.com"
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">✏️</span>
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">🎭</span>
                        Vai trò
                      </label>
                      <input
                        type="text"
                        value={user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                        disabled
                        className="input-disabled"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">📅</span>
                        Ngày tạo tài khoản
                      </label>
                      <input
                        type="text"
                        value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                        disabled
                        className="input-disabled"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-cancel"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        className="btn-save"
                        disabled={loading}
                      >
                        {loading ? '⏳ Đang lưu...' : '✅ Lưu thay đổi'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              /* Change Password Card */
              <div className="profile-card">
                <div className="card-header">
                  <h2>🔒 Đổi mật khẩu</h2>
                  <button className="btn-back-form" onClick={handleCancelPassword}>
                    ← Quay lại
                  </button>
                </div>

                <form onSubmit={handleChangePassword}>
                  <div className="form-section">
                    <div className="password-notice">
                      <span className="notice-icon">ℹ️</span>
                      <p>Mật khẩu phải có ít nhất 6 ký tự</p>
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">🔐</span>
                        Mật khẩu cũ <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className={errors.oldPassword ? 'input-error' : ''}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      {errors.oldPassword && <span className="error-message">{errors.oldPassword}</span>}
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">🔑</span>
                        Mật khẩu mới <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={errors.newPassword ? 'input-error' : ''}
                        placeholder="Nhập mật khẩu mới"
                      />
                      {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                    </div>

                    <div className="form-group">
                      <label>
                        <span className="label-icon">🔄</span>
                        Xác nhận mật khẩu mới <span className="required">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={errors.confirmPassword ? 'input-error' : ''}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={handleCancelPassword}
                      disabled={loading}
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      className="btn-save"
                      disabled={loading}
                    >
                      {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
              <div className="action-card" onClick={() => navigate('/orders')}>
                <div className="action-icon">📦</div>
                <div className="action-content">
                  <h3>Đơn hàng của tôi</h3>
                  <p>Xem và quản lý đơn hàng</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div className="action-card" onClick={() => navigate('/')}>
                <div className="action-icon">🛍️</div>
                <div className="action-content">
                  <h3>Tiếp tục mua sắm</h3>
                  <p>Khám phá sản phẩm mới</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ClientProfile;