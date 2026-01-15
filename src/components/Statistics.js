import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import '../styles/Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalQuantity: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });
  
  const [categoryStats, setCategoryStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAllProducts(),
        categoryAPI.getAllCategories()
      ]);

      const products = productsRes.data;
      const categories = categoriesRes.data;

      // Calculate basic stats
      const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
      const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
      const lowStock = products.filter(p => p.quantity > 0 && p.quantity < 10).length;
      const outOfStock = products.filter(p => p.quantity === 0).length;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalQuantity,
        totalRevenue,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock
      });

      // Calculate category statistics
      const catStats = categories.map(cat => {
        const catProducts = products.filter(p => p.categoryId === cat.id);
        const revenue = catProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        return {
          id: cat.id,
          name: cat.name,
          productCount: catProducts.length,
          revenue
        };
      }).sort((a, b) => b.revenue - a.revenue);

      setCategoryStats(catStats);

      // Top products by value
      const topProds = [...products]
        .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
        .slice(0, 5);
      setTopProducts(topProds);

      // Recent products (last 5)
      const recentProds = [...products].slice(-5).reverse();
      setRecentProducts(recentProds);

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className="statistics-dashboard">
      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-products">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Tổng sản phẩm</div>
          </div>
        </div>

        <div className="stat-card stat-categories">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCategories}</div>
            <div className="stat-label">Danh mục</div>
          </div>
        </div>

        <div className="stat-card stat-quantity">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalQuantity.toLocaleString('vi-VN')}</div>
            <div className="stat-label">Tổng số lượng</div>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Tổng giá trị (VNĐ)</div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
        <div className="alert-cards">
          {stats.lowStockProducts > 0 && (
            <div className="alert-card alert-warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <div className="alert-title">Cảnh báo tồn kho thấp</div>
                <div className="alert-text">
                  {stats.lowStockProducts} sản phẩm có số lượng dưới 10
                </div>
              </div>
            </div>
          )}

          {stats.outOfStockProducts > 0 && (
            <div className="alert-card alert-danger">
              <div className="alert-icon">🚫</div>
              <div className="alert-content">
                <div className="alert-title">Hết hàng</div>
                <div className="alert-text">
                  {stats.outOfStockProducts} sản phẩm đã hết hàng
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="stats-content">
        {/* Left Column */}
        <div className="stats-column">
          {/* Category Statistics */}
          <div className="stats-section">
            <div className="section-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                Thống kê theo danh mục
              </h3>
            </div>
            
            <div className="category-stats-list">
              {categoryStats.length === 0 ? (
                <div className="empty-state">
                  <p>Chưa có dữ liệu danh mục</p>
                </div>
              ) : (
                categoryStats.map((cat, index) => (
                  <div key={cat.id} className="category-stat-item">
                    <div className="category-rank">#{index + 1}</div>
                    <div className="category-info">
                      <div className="category-name">{cat.name}</div>
                      <div className="category-details">
                        <span className="product-count">{cat.productCount} sản phẩm</span>
                      </div>
                    </div>
                    <div className="category-revenue">
                      {cat.revenue.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Products */}
          <div className="stats-section">
            <div className="section-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Sản phẩm mới nhất
              </h3>
            </div>
            
            <div className="recent-products-list">
              {recentProducts.length === 0 ? (
                <div className="empty-state">
                  <p>Chưa có sản phẩm</p>
                </div>
              ) : (
                recentProducts.map(product => (
                  <div key={product.id} className="recent-product-item">
                    <div className="product-icon">📦</div>
                    <div className="product-details">
                      <div className="product-name">{product.name}</div>
                      <div className="product-meta">
                        <span className="product-price">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </span>
                        <span className="product-stock">
                          Kho: {product.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="stats-column">
          {/* Top Products */}
          <div className="stats-section">
            <div className="section-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Top 5 sản phẩm giá trị cao
              </h3>
            </div>
            
            <div className="top-products-list">
              {topProducts.length === 0 ? (
                <div className="empty-state">
                  <p>Chưa có sản phẩm</p>
                </div>
              ) : (
                topProducts.map((product, index) => {
                  const value = product.price * product.quantity;
                  return (
                    <div key={product.id} className="top-product-item">
                      <div className={`product-medal medal-${index + 1}`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="product-info-top">
                        <div className="product-name-top">{product.name}</div>
                        <div className="product-specs">
                          <span>{product.price.toLocaleString('vi-VN')} ₫</span>
                          <span>×</span>
                          <span>{product.quantity}</span>
                        </div>
                      </div>
                      <div className="product-total-value">
                        {value.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-section">
            <div className="section-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Phân tích nhanh
              </h3>
            </div>
            
            <div className="quick-stats">
              <div className="quick-stat-item">
                <div className="quick-stat-label">Giá trị TB/sản phẩm</div>
                <div className="quick-stat-value">
                  {stats.totalProducts > 0 
                    ? (stats.totalRevenue / stats.totalProducts).toLocaleString('vi-VN', { maximumFractionDigits: 0 })
                    : 0
                  } ₫
                </div>
              </div>
              
              <div className="quick-stat-item">
                <div className="quick-stat-label">Số lượng TB/sản phẩm</div>
                <div className="quick-stat-value">
                  {stats.totalProducts > 0 
                    ? Math.round(stats.totalQuantity / stats.totalProducts)
                    : 0
                  }
                </div>
              </div>

              <div className="quick-stat-item">
                <div className="quick-stat-label">Tỷ lệ còn hàng</div>
                <div className="quick-stat-value">
                  {stats.totalProducts > 0 
                    ? Math.round(((stats.totalProducts - stats.outOfStockProducts) / stats.totalProducts) * 100)
                    : 0
                  }%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;