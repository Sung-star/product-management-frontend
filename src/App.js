import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';

import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ClientShop from './components/ClientShop';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CheckoutPage from './components/CheckoutPage'; // Import CheckoutPage mới
import ClientOrders from './components/ClientOrders';
import ClientProfile from './components/ClientProfile';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route path="/orders" element={<ClientOrders />} />
              <Route path="/profile" element={<ClientProfile />} />
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Client Routes */}
              <Route path="/" element={<ClientShop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {/* Admin Routes - Protected */}
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
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;