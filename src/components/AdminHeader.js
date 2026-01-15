import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminHeader.css';

const AdminHeader = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="header-logo">
          <span className="header-logo-icon">🎵</span>
          <span className="header-logo-text">Product Manager</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="header-avatar">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <span className="header-username">{currentUser?.name || 'Admin'}</span>
        </div>
        <button className="header-logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;