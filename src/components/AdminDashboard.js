import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import Statistics from './Statistics';
import ProductList from './ProductList';
import CategoryManager from './CategoryManager';
import OrderManager from './OrderManager';
import UserManager from './UserManager';
import SettingsPage from './SettingsPage';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="admin-dashboard">
      <AdminHeader />

      <div className="admin-layout">
        <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/admin" end className="nav-item">
              <span className="nav-icon">📊</span>
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink to="/admin/products" className="nav-item">
              <span className="nav-icon">📦</span>
              {!isSidebarCollapsed && <span>Sản phẩm</span>}
            </NavLink>

            <NavLink to="/admin/categories" className="nav-item">
              <span className="nav-icon">📁</span>
              {!isSidebarCollapsed && <span>Danh mục</span>}
            </NavLink>

            <NavLink to="/admin/orders" className="nav-item">
              <span className="nav-icon">🛒</span>
              {!isSidebarCollapsed && <span>Đơn hàng</span>}
            </NavLink>

            <NavLink to="/admin/users" className="nav-item">
              <span className="nav-icon">👥</span>
              {!isSidebarCollapsed && <span>Người dùng</span>}
            </NavLink>

            <div className="nav-divider"></div>

            <NavLink to="/admin/settings" className="nav-item">
              <span className="nav-icon">⚙️</span>
              {!isSidebarCollapsed && <span>Cài đặt</span>}
            </NavLink>
          </nav>
        </aside>

        <main className="admin-main">
          <Routes>
            <Route index element={<Statistics />} />
            <Route path="products" element={<ProductList />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;