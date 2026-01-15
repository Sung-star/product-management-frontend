import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../components/LoginPage';
import AdminDashboard from '../components/AdminDashboard';
import ClientShop from '../components/ClientShop';
import ProductDetail from '../components/ProductDetail';
import CartPage from '../components/CartPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && currentUser.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to={currentUser.role === 'ADMIN' ? '/admin' : '/'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Client Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ClientShop />
          </ProtectedRoute>
        }
      />

      <Route
        path="/product/:id"
        element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;