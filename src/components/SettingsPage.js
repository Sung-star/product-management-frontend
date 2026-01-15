import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    darkMode: false,
    language: 'vi'
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    addToast('Cập nhật thông tin thành công!', 'success');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      addToast('Mật khẩu phải có ít nhất 6 ký tự!', 'warning');
      return;
    }
    
    addToast('Đổi mật khẩu thành công!', 'success');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSettingsChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    addToast('Đã lưu cài đặt!', 'success');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Cài đặt</h1>
        <p>Quản lý thông tin tài khoản và cài đặt hệ thống</p>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            <span>Thông tin cá nhân</span>
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="tab-icon">🔒</span>
            <span>Bảo mật</span>
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">🔔</span>
            <span>Thông báo</span>
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span className="tab-icon">🎨</span>
            <span>Giao diện</span>
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <span className="tab-icon">💻</span>
            <span>Hệ thống</span>
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Thông tin cá nhân</h2>
                <p>Cập nhật thông tin tài khoản của bạn</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                      type="text"
                      value={currentUser?.username || ''}
                      disabled
                      className="input-disabled"
                    />
                    <small>Không thể thay đổi tên đăng nhập</small>
                  </div>

                  <div className="form-group">
                    <label>Vai trò</label>
                    <input
                      type="text"
                      value={currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    💾 Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Bảo mật tài khoản</h2>
                <p>Đổi mật khẩu và cài đặt bảo mật</p>
              </div>

              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <small>Mật khẩu phải có ít nhất 6 ký tự</small>
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    🔒 Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Cài đặt thông báo</h2>
                <p>Quản lý các thông báo bạn nhận được</p>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📧 Thông báo qua Email</h3>
                    <p>Nhận thông báo quan trọng qua email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={() => handleSettingsChange('emailNotifications')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>📦 Cập nhật đơn hàng</h3>
                    <p>Nhận thông báo về trạng thái đơn hàng</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.orderUpdates}
                      onChange={() => handleSettingsChange('orderUpdates')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🎁 Khuyến mãi</h3>
                    <p>Nhận thông báo về các chương trình khuyến mãi</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.promotions}
                      onChange={() => handleSettingsChange('promotions')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Giao diện & Ngôn ngữ</h2>
                <p>Tùy chỉnh giao diện hiển thị</p>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🌙 Chế độ tối</h3>
                    <p>Sử dụng giao diện tối cho mắt</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={() => handleSettingsChange('darkMode')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>🌐 Ngôn ngữ</h3>
                    <p>Chọn ngôn ngữ hiển thị</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="select-input"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Thông tin hệ thống</h2>
                <p>Chi tiết về phiên bản và hệ thống</p>
              </div>

              <div className="system-info">
                <div className="info-card">
                  <div className="info-icon">🚀</div>
                  <div className="info-content">
                    <h3>Phiên bản</h3>
                    <p>v1.0.0</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">⏰</div>
                  <div className="info-content">
                    <h3>Đăng nhập lần cuối</h3>
                    <p>{new Date(currentUser?.loginTime || Date.now()).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">💻</div>
                  <div className="info-content">
                    <h3>Trình duyệt</h3>
                    <p>{navigator.userAgent.split(' ').slice(-1)[0]}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">🌍</div>
                  <div className="info-content">
                    <h3>Múi giờ</h3>
                    <p>GMT+7 (Hồ Chí Minh)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;