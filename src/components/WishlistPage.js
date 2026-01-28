import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { useToast } from './Toast';
import { useCart } from '../context/CartContext';
import Footer from './Footer';
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineEye
} from 'react-icons/hi';
import '../styles/WishlistPage.css';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addToCart } = useCart();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.id) {
      addToast('Vui lòng đăng nhập để xem danh sách yêu thích!', 'error');
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user.id]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getUserWishlist(user.id);
      setWishlist(response.data);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      addToast('Không thể tải danh sách yêu thích!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(user.id, productId);
      setWishlist(prev => prev.filter(item => item.productId !== productId));
      addToast('Đã xóa khỏi danh sách yêu thích!', 'success');
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      addToast('Không thể xóa sản phẩm!', 'error');
    }
  };

  const handleAddToCart = (item) => {
    if (!item.productActive) {
      addToast('Sản phẩm này hiện không khả dụng!', 'error');
      return;
    }

    if (item.productQuantity <= 0) {
      addToast('Sản phẩm đã hết hàng!', 'error');
      return;
    }

    addToCart({
      id: item.productId,
      name: item.productName,
      price: item.productPrice,
      imageUrls: item.productImageUrls,
      quantity: item.productQuantity
    });
    
    addToast('Đã thêm vào giỏ hàng!', 'success');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getImageUrl = (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return '/placeholder.png';
    return `http://localhost:8080/${imageUrls[0]}`;
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <button className="btn-back" onClick={() => navigate('/profile')}>
              <HiOutlineArrowLeft /> Quay lại
            </button>
            <h1>
              <HiHeart /> Sản phẩm yêu thích
              <span className="wishlist-count">({wishlist.length})</span>
            </h1>
          </div>

          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <HiOutlineHeart className="empty-icon" />
              <h2>Danh sách yêu thích trống</h2>
              <p>Hãy thêm sản phẩm yêu thích để dễ dàng theo dõi!</p>
              <button 
                className="btn-shop-now" 
                onClick={() => navigate('/')}
              >
                <HiOutlineShoppingCart /> Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <div className="item-image">
                    <img 
                      src={getImageUrl(item.productImageUrls)} 
                      alt={item.productName}
                      onClick={() => navigate(`/product/${item.productId}`)}
                    />
                    {!item.productActive && (
                      <div className="status-badge inactive">
                        Ngừng bán
                      </div>
                    )}
                    {item.productActive && item.productQuantity === 0 && (
                      <div className="status-badge out-of-stock">
                        Hết hàng
                      </div>
                    )}
                    <button
                      className="btn-remove"
                      onClick={() => handleRemove(item.productId)}
                      title="Xóa khỏi yêu thích"
                    >
                      <HiHeart />
                    </button>
                  </div>

                  <div className="item-content">
                    <h3 
                      className="item-name"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.productName}
                    </h3>
                    
                    <div className="item-price">
                      {formatPrice(item.productPrice)}
                    </div>

                    <div className="item-stock">
                      {item.productActive ? (
                        item.productQuantity > 0 ? (
                          <span className="in-stock">
                            Còn {item.productQuantity} sản phẩm
                          </span>
                        ) : (
                          <span className="out-of-stock">Hết hàng</span>
                        )
                      ) : (
                        <span className="inactive">Ngừng kinh doanh</span>
                      )}
                    </div>

                    <div className="item-actions">
                      <button
                        className="btn-add-cart"
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.productActive || item.productQuantity === 0}
                      >
                        <HiOutlineShoppingCart /> Thêm vào giỏ
                      </button>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        <HiOutlineEye /> Xem
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;