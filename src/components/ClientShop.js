import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import ProductCard from './ProductCard';
import { SkeletonGrid } from './Skeleton';
import Footer from './Footer';
import { 
  HiOutlineShoppingCart,
  HiOutlineShoppingBag,
  HiOutlineSearch,
  HiOutlineAdjustments,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineCube,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineChevronDown,
  HiOutlineCheck
} from 'react-icons/hi';
import '../styles/ClientShop.css';

const ClientShop = () => {
  const navigate = useNavigate();
  const { addToCart, getCartItemCount, clearCart } = useCart();
  const { addToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    priceRange: 'all',
    sortBy: 'default'
  });

  // ✅ Cập nhật cách lấy User: Kiểm tra cả 2 key phổ biến
  const user = JSON.parse(localStorage.getItem('user_auth') || localStorage.getItem('user') || '{}');

  // ✅ Helper hiển thị ảnh từ server
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    fetchData();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-menu-container')) {
      setShowUserMenu(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAllProducts(),
        categoryAPI.getAllCategories()
      ]);
      setProducts(productsRes.data);
      setFilteredProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      addToast('Không thể tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...products];

    if (filters.search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.categoryId !== 'all') {
      result = result.filter(p => p.categoryId === parseInt(filters.categoryId));
    }

    if (filters.priceRange !== 'all') {
      switch (filters.priceRange) {
        case 'under-50k':
          result = result.filter(p => p.price < 50000);
          break;
        case '50k-100k':
          result = result.filter(p => p.price >= 50000 && p.price < 100000);
          break;
        case '100k-500k':
          result = result.filter(p => p.price >= 100000 && p.price < 500000);
          break;
        case 'over-500k':
          result = result.filter(p => p.price >= 500000);
          break;
        default:
          break;
      }
    }

    switch (filters.sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: break;
    }

    setFilteredProducts(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = (product) => {
    if (product.quantity <= 0) {
      addToast('Sản phẩm đã hết hàng!', 'warning');
      return;
    }
    addToCart(product);
    addToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      clearCart();
      localStorage.removeItem('user');
      localStorage.removeItem('user_auth'); // Xóa cả 2 key
      localStorage.removeItem('auth_token');
      navigate('/login');
      addToast('Đã đăng xuất thành công!', 'info');
    }
  };

  const resetFilters = () => {
    setFilters({ search: '', categoryId: 'all', priceRange: 'all', sortBy: 'default' });
  };

  return (
    <>
      <div className="client-shop">
        {/* Header */}
        <div className="shop-header-wrapper">
          <div className="shop-header">
            <div className="header-left">
              <div className="shop-logo">
                <HiOutlineShoppingBag />
              </div>
              <div>
                <h1>Cửa Hàng</h1>
                <p className="header-subtitle">{filteredProducts.length} sản phẩm</p>
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                className="view-mode-btn" 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <HiOutlineViewList /> : <HiOutlineViewGrid />}
              </button>
              
              <button className="cart-btn" onClick={() => navigate('/cart')}>
                <HiOutlineShoppingCart className="cart-icon" />
                <span className="cart-text">Giỏ hàng</span>
                {getCartItemCount() > 0 && (
                  <span className="cart-badge">{getCartItemCount()}</span>
                )}
              </button>

              {/* ✅ User Menu - Sửa ảnh và tên */}
              <div className="user-menu-container">
                <button 
                  className="user-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                >
                  <div className="user-avatar">
                    {user.avatarUrl ? (
                      <img src={getFullImageUrl(user.avatarUrl)} alt="Avatar" />
                    ) : (
                      user.fullName ? user.fullName.charAt(0).toUpperCase() : <HiOutlineUser />
                    )}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {user.avatarUrl ? (
                          <img src={getFullImageUrl(user.avatarUrl)} alt="Avatar" />
                        ) : (
                          user.fullName ? user.fullName.charAt(0).toUpperCase() : <HiOutlineUser />
                        )}
                      </div>
                      <div className="user-details">
                        {/* ✅ Đổi tên từ user.name sang user.fullName */}
                        <div className="user-name">{user.fullName || user.username || 'Khách hàng'}</div>
                        <div className="user-email">{user.email || ''}</div>
                      </div>
                    </div>
                    
                    <div className="menu-divider"></div>
                    
                    <button className="menu-item" onClick={() => navigate('/profile')}>
                      <HiOutlineUser className="menu-icon" />
                      <span>Tài khoản</span>
                    </button>
                    
                    <button className="menu-item" onClick={() => navigate('/orders')}>
                      <HiOutlineCube className="menu-icon" />
                      <span>Đơn hàng</span>
                    </button>
                    
                    <div className="menu-divider"></div>
                    
                    <button className="menu-item logout" onClick={handleLogout}>
                      <HiOutlineLogout className="menu-icon" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="search-filter-section">
          <div className="search-bar-enhanced">
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input-enhanced"
            />
          </div>
          
          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <HiOutlineAdjustments className="filter-icon" />
            <span>Lọc</span>
            <HiOutlineChevronDown className={`chevron ${showFilters ? 'rotate' : ''}`} />
          </button>
        </div>

        {/* Quick Category Filter */}
        <div className="quick-categories">
          <button
            className={`category-quick-btn ${filters.categoryId === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('categoryId', 'all')}
          >
            <HiOutlineCube /> Tất cả
          </button>
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat.id}
              className={`category-quick-btn ${filters.categoryId === cat.id ? 'active' : ''}`}
              onClick={() => handleFilterChange('categoryId', cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Khoảng giá</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="under-50k">Dưới 50.000đ</option>
                  <option value="50k-100k">50.000đ - 100.000đ</option>
                  <option value="100k-500k">100.000đ - 500.000đ</option>
                  <option value="over-500k">Trên 500.000đ</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Sắp xếp</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="filter-select"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="name-asc">Tên: A → Z</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-reset-filter" onClick={resetFilters}>
                <HiOutlineRefresh /> Đặt lại
              </button>
              <button className="btn-close-filter" onClick={() => setShowFilters(false)}>
                <HiOutlineCheck /> Áp dụng
              </button>
            </div>
          </div>
        )}

        {/* Products Container */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : (
          <div className={`products-container ${viewMode}`}>
            {filteredProducts.length === 0 ? (
              <div className="no-products-found">
                <HiOutlineSearch className="no-products-icon" />
                <h3>Không tìm thấy sản phẩm</h3>
                <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                <button className="btn-reset-all" onClick={resetFilters}>
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  viewMode={viewMode}
                />
              ))
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
};

export default ClientShop;