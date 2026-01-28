import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, addressAPI, uploadAPI } from '../services/api';
import { useToast } from './Toast';
import Footer from './Footer';
import AddressManagement from './AddressManagement';
import {
  HiOutlineArrowLeft, HiOutlineUser, HiOutlineMail, HiOutlinePencil,
  HiOutlineShieldCheck, HiOutlineCalendar, HiOutlineLockClosed,
  HiOutlineKey, HiOutlineRefresh, HiOutlineCube, HiOutlineShoppingBag,
  HiOutlineChevronRight, HiOutlineCheck, HiOutlineX, HiOutlineInformationCircle,
  HiOutlineLocationMarker, HiOutlinePhone, HiOutlineCamera, HiOutlineHeart, HiOutlineBell
} from 'react-icons/hi';
import '../styles/ClientProfile.css';

const ClientProfile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // ✅ Khởi tạo user từ localStorage (kiểm tra cả 2 key phổ biến)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_auth') || localStorage.getItem('user');
    return JSON.parse(savedUser || '{}');
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Helper xử lý URL ảnh từ server
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // 🟢 Thay localhost bằng biến môi trường
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const [avatarPreview, setAvatarPreview] = useState(getFullImageUrl(user.avatarUrl));

  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    fullName: user.fullName || '',
    phone: user.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Reset formData khi user thay đổi
  useEffect(() => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      fullName: user.fullName || '',
      phone: user.phone || '',
    });
    setAvatarPreview(getFullImageUrl(user.avatarUrl));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setLoading(true);
      await userAPI.updateUser(user.id, formData);
      const updatedUser = { ...user, ...formData };
      
      // Cập nhật cả 2 key localStorage
      localStorage.setItem('user_auth', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setIsEditing(false);
      addToast('Cập nhật thông tin thành công!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Không thể cập nhật!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file ảnh!', 'error');
      return;
    }

    // Xem trước ảnh tạm thời
    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    try {
      setLoading(true);
      const response = await uploadAPI.uploadAvatar(user.id, file);
      
      // Backend trả về link ảnh mới
      const newAvatarUrl = response.data.avatarUrl || response.data;
      const updatedUser = { ...user, avatarUrl: newAvatarUrl };

      localStorage.setItem('user_auth', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      setAvatarPreview(getFullImageUrl(newAvatarUrl));
      addToast('Cập nhật ảnh đại diện thành công!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Không thể tải ảnh lên!', 'error');
      setAvatarPreview(getFullImageUrl(user.avatarUrl));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (showPasswordForm) {
      return (
        <div className="profile-card">
          <div className="card-header">
            <h2><HiOutlineLockClosed /> Đổi mật khẩu</h2>
            <button className="btn-back-form" onClick={() => setShowPasswordForm(false)}>
              <HiOutlineArrowLeft /> Quay lại
            </button>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
             <div className="form-section">
                <p>Chức năng đổi mật khẩu đang được cập nhật...</p>
             </div>
             <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPasswordForm(false)}>Hủy</button>
             </div>
          </form>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-card">
            <div className="card-header">
              <h2><HiOutlineUser /> Thông tin cá nhân</h2>
              {!isEditing && (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <HiOutlinePencil /> Chỉnh sửa
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-section">
                <div className="form-group">
                  <label><HiOutlineUser className="label-icon" /> Tên đăng nhập</label>
                  <input type="text" value={formData.username} disabled className="input-disabled" />
                </div>

                <div className="form-group">
                  <label><HiOutlineMail className="label-icon" /> Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label><HiOutlinePencil className="label-icon" /> Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label><HiOutlinePhone className="label-icon" /> Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>Hủy</button>
                  <button type="submit" className="btn-save" disabled={loading}>Lưu thay đổi</button>
                </div>
              )}
            </form>
          </div>
        );

      case 'addresses':
        return <AddressManagement userId={user.id} />;

      default:
        return null;
    }
  };

  return (
    <>
      <div className="client-profile">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <HiOutlineArrowLeft /> Quay lại trang chủ
          </button>
          <div className="header-content">
            <h1>Tài Khoản Của Tôi</h1>
          </div>
        </div>

        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="user-card">
              <div className="avatar-container">
                <div className="user-avatar-large">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.fullName?.charAt(0) || user.username?.charAt(0)}
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                  <HiOutlineCamera />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <h3 className="user-name">{user.fullName || user.username}</h3>
              <p className="user-email">{user.email}</p>
            </div>

            <div className="menu-list">
              <button 
                className={`menu-item ${activeTab === 'profile' && !showPasswordForm ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setShowPasswordForm(false); }}
              >
                <HiOutlineUser className="menu-icon" /> Thông tin cá nhân
              </button>
              
              <button 
                className={`menu-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => { setActiveTab('addresses'); setShowPasswordForm(false); }}
              >
                <HiOutlineLocationMarker className="menu-icon" /> Địa chỉ giao hàng
              </button>

              <button className="menu-item" onClick={() => navigate('/orders')}>
                <HiOutlineCube className="menu-icon" /> Đơn hàng
              </button>

              <button className="menu-item" onClick={() => setShowPasswordForm(true)}>
                <HiOutlineLockClosed className="menu-icon" /> Đổi mật khẩu
              </button>
            </div>
          </div>

          <div className="profile-main">
            {renderContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClientProfile;