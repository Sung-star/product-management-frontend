import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const ProductCard = ({ product, onAddToCart, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const getProductImages = () => {
  if (product.imageUrls) {
    if (Array.isArray(product.imageUrls)) {
      return product.imageUrls.map(url => `${API_URL}${url}`);
    }
    if (typeof product.imageUrls === 'string') {
      return product.imageUrls.split(',').map(url => `${API_URL}${url.trim()}`);
    }
  }
  return ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'];
};

  const images = getProductImages();

  const getBadge = () => {
    if (product.quantity === 0) {
      return <span className="badge badge-out">HẾT HÀNG</span>;
    }
    if (product.quantity < 5) {
      return <span className="badge badge-low">SẮP HẾT</span>;
    }
    if (product.price < 200000) {
      return <span className="badge badge-sale">🔥 SALE HOT</span>;
    }
    if (product.createdAt && new Date() - new Date(product.createdAt) < 7 * 24 * 60 * 60 * 1000) {
      return <span className="badge badge-new">✨ MỚI</span>;
    }
    return null;
  };

  const getStockClass = () => {
    if (product.quantity === 0) return 'out-of-stock';
    if (product.quantity < 5) return 'low-stock';
    return 'in-stock';
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.quantity > 0) {
      onAddToCart(product);
    }
  };

  const handleImageError = (e) => {
    if (!imageError) {
      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
      setImageError(true);
    }
  };

  const calculateDiscount = () => {
    if (product.price > 500000) {
      return '16%';
    }
    return null;
  };

  return (
    <div className={`product-card ${viewMode === 'list' ? 'list-view' : ''}`} onClick={handleCardClick}>
      <div className="product-card-image-wrapper">
        <img 
          src={images[0]}
          alt={product.name}
          className="product-card-image"
          onError={handleImageError}
          loading="lazy"
        />
        {getBadge()}
        
        {images.length > 1 && (
          <div className="image-count-badge">
            📷 {images.length}
          </div>
        )}
        
        {product.quantity > 0 && product.quantity < 10 && (
          <div className="stock-indicator">
            Chỉ còn {product.quantity}
          </div>
        )}

        {calculateDiscount() && (
          <div className="discount-badge">
            -{calculateDiscount()}
          </div>
        )}

        {product.quantity === 0 && (
          <div className="sold-out-overlay">
            <span>HẾT HÀNG</span>
          </div>
        )}
      </div>

      <div className="product-card-content">
        {product.categoryName && (
          <div className="product-category-mini">
            📂 {product.categoryName}
          </div>
        )}

        <h3 className="product-card-title">{product.name}</h3>
        
        {product.description && (
          <p className="product-card-description">{product.description}</p>
        )}

        <div className="product-card-footer">
          <div className="price-section">
            <div className="current-price">
              {product.price?.toLocaleString('vi-VN')} ₫
            </div>
            {product.price > 500000 && (
              <div className="old-price">
                {(product.price * 1.2).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          <button
            className={`btn-add-to-cart ${product.quantity === 0 ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            title={product.quantity === 0 ? 'Sản phẩm đã hết hàng' : 'Thêm vào giỏ hàng'}
          >
            {product.quantity === 0 ? '❌' : '🛒'}
          </button>
        </div>

        <div className={`stock-info ${getStockClass()}`}>
          {product.quantity === 0 ? (
            '⛔ Hết hàng'
          ) : product.quantity < 5 ? (
            `⚠️ Chỉ còn ${product.quantity} sản phẩm`
          ) : (
            `✅ Còn ${product.quantity} sản phẩm`
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;