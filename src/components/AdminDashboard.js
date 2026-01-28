import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { 
  HiOutlineChartBar, 
  HiOutlineCube, 
  HiOutlineFolder, 
  HiOutlineShoppingCart, 
  HiOutlineUsers, 
  HiOutlineCog,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import AdminHeader from './AdminHeader';
import Statistics from './Statistics';
import ProductList from './ProductList';
import CategoryManager from './CategoryManager';
import OrderManager from './OrderManager';
import UserManager from './UserManager';
import SettingsPage from './SettingsPage';
import '../styles/AdminDashboard.css';
import { HiOutlineStar } from 'react-icons/hi';
import ReviewManager from './ReviewManager';
const AdminDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin', end: true, icon: HiOutlineChartBar, label: 'Dashboard' },
    { path: '/admin/products', icon: HiOutlineCube, label: 'Sản phẩm' },
    { path: '/admin/categories', icon: HiOutlineFolder, label: 'Danh mục' },
    { path: '/admin/orders', icon: HiOutlineShoppingCart, label: 'Đơn hàng' },
    { path: '/admin/reviews', icon: HiOutlineStar, label: 'Đánh giá' },
    { path: '/admin/users', icon: HiOutlineUsers, label: 'Người dùng' },
  ];

  return (
    <div className="admin-dashboard">
      <AdminHeader />

      <div className="admin-layout">
        <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              {isSidebarCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
            </button>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                end={item.end}
                className="nav-item"
                title={isSidebarCollapsed ? item.label : ''}
              >
                <item.icon className="nav-icon" />
                {!isSidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            ))}

            <div className="nav-divider"></div>

            <NavLink 
              to="/admin/settings" 
              className="nav-item"
              title={isSidebarCollapsed ? 'Cài đặt' : ''}
            >
              <HiOutlineCog className="nav-icon" />
              {!isSidebarCollapsed && <span className="nav-label">Cài đặt</span>}
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
            <Route path="reviews" element={<ReviewManager />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;