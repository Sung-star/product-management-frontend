import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(id);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      addToast('Không thể tải sản phẩm!', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getProductImages = () => {
    if (!product) return [];
    
    if (product.imageUrls) {
      // Nếu imageUrls là array
      if (Array.isArray(product.imageUrls)) {
        return product.imageUrls.map(url => `http://localhost:8080${url}`);
      }
      // Nếu imageUrls là string
      if (typeof product.imageUrls === 'string') {
        return product.imageUrls.split(',')
          .map(url => `http://localhost:8080${url.trim()}`);
      }
    }
    
    // Fallback images
    const name = product.name?.toLowerCase() || '';
    const baseImages = {
      laptop: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800'
      ],
      phone: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1592286927505-c7278dd0bbb7?w=800'
      ],
      default: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
        'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800'
      ]
    };

    if (name.includes('laptop')) return baseImages.laptop;
    if (name.includes('phone') || name.includes('iphone')) return baseImages.phone;
    return baseImages.default;
  };

  const handleAddToCart = () => {
    if (product.quantity === 0) {
      addToast('Sản phẩm đã hết hàng!', 'error');
      return;
    }

    if (quantity > product.quantity) {
      addToast(`Chỉ còn ${product.quantity} sản phẩm!`, 'warning');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    addToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate('/')}>Quay lại trang chủ</button>
      </div>
    );
  }

  const images = getProductImages();

  return (
    <div className="product-detail-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="product-detail-content">
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={images[selectedImage]} 
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
              }}
            />
            {product.quantity === 0 && (
              <div className="out-of-stock-overlay">HẾT HÀNG</div>
            )}
            {images.length > 1 && (
              <div className="image-counter">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <h1 className="product-detail-title">{product.name}</h1>
          
          {product.categoryName && (
            <div className="product-category-tag">
              📂 {product.categoryName}
            </div>
          )}

          <div className="product-price-section">
            <div className="current-price">
              {product.price?.toLocaleString('vi-VN')} ₫
            </div>
            {product.price > 500000 && (
              <div className="old-price">
                {(product.price * 1.2).toLocaleString('vi-VN')} ₫
              </div>
            )}
          </div>

          <div className="product-stock-section">
            {product.quantity === 0 ? (
              <span className="stock-badge out">⛔ Hết hàng</span>
            ) : product.quantity < 5 ? (
              <span className="stock-badge low">⚠️ Chỉ còn {product.quantity} sản phẩm</span>
            ) : (
              <span className="stock-badge in">✅ Còn {product.quantity} sản phẩm</span>
            )}
          </div>

          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</p>
          </div>

          <div className="quantity-selector">
            <label>Số lượng:</label>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.quantity === 0}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseInt(e.target.value) || 1)))}
                disabled={product.quantity === 0}
              />
              <button
                onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                disabled={product.quantity === 0}
              >
                +
              </button>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              🛒 Thêm vào giỏ hàng
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={product.quantity === 0}
            >
              ⚡ Mua ngay
            </button>
          </div>

          <div className="product-meta">
            <div className="meta-item">
              <span>ID sản phẩm:</span>
              <strong>#{product.id}</strong>
            </div>
            {product.createdAt && (
              <div className="meta-item">
                <span>Ngày thêm:</span>
                <strong>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;