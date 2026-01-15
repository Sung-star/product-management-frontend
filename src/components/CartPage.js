import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import '../styles/CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { addToast } = useToast();

  const handleCheckout = () => {
    if (cart.length === 0) {
      addToast('Giỏ hàng trống!', 'warning');
      return;
    }
    
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      clearCart();
      addToast('Đã xóa giỏ hàng!', 'success');
    }
  };

  const handleRemoveItem = (productId, productName) => {
    if (window.confirm(`Xóa "${productName}" khỏi giỏ hàng?`)) {
      removeFromCart(productId);
      addToast('Đã xóa sản phẩm!', 'success');
    }
  };

  const handleUpdateQuantity = (productId, newQuantity, maxQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxQuantity) {
      addToast(`Chỉ còn ${maxQuantity} sản phẩm!`, 'warning');
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <button onClick={() => navigate('/')} className="btn-continue-shopping">
          🛍️ Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header-section">
        <div>
          <h1>🛒 Giỏ Hàng Của Bạn</h1>
          <p>Bạn có {cart.length} sản phẩm trong giỏ hàng</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-back-shop">
          ← Tiếp tục mua sắm
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-items-section">
          {cart.map((item) => (
            <div key={item.id} className="cart-item-card">
              <div className="cart-item-image" onClick={() => navigate(`/product/${item.id}`)}>
                <img
                  src={
                    item.imageUrls?.length > 0
                      ? `http://localhost:8080${item.imageUrls[0]}`
                      : '/no-image.png'
                  }
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';
                  }}
                />
              </div>

              <div className="cart-item-details">
                <h3 onClick={() => navigate(`/product/${item.id}`)} className="cart-item-name">
                  {item.name}
                </h3>
                <p className="cart-item-category">
                  📂 {item.categoryName || 'Không có danh mục'}
                </p>
                <p className="cart-item-price">
                  {item.price?.toLocaleString('vi-VN')} ₫
                </p>
                <div className="cart-item-stock">
                  {item.quantity > 5 ? (
                    <span className="stock-available">✅ Còn hàng</span>
                  ) : item.quantity > 0 ? (
                    <span className="stock-low">⚠️ Chỉ còn {item.quantity} sản phẩm</span>
                  ) : (
                    <span className="stock-out">❌ Hết hàng</span>
                  )}
                </div>
              </div>

              <div className="cart-item-actions">
                <div className="cart-quantity-controls">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.cartQuantity - 1, item.quantity)}
                    className="qty-btn"
                    disabled={item.cartQuantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.cartQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      handleUpdateQuantity(item.id, val, item.quantity);
                    }}
                    className="qty-input"
                    min="1"
                    max={item.quantity}
                  />
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.cartQuantity + 1, item.quantity)}
                    className="qty-btn"
                    disabled={item.cartQuantity >= item.quantity}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <div className="total-label">Tổng cộng:</div>
                  <div className="total-price">
                    {(item.price * item.cartQuantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="btn-remove-item"
                  title="Xóa sản phẩm"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>💰 Tổng đơn hàng</h3>

            <div className="summary-details">
              <div className="summary-row">
                <span>Tạm tính ({cart.length} sản phẩm)</span>
                <span>{getCartTotal().toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span className="free-shipping">Miễn phí</span>
              </div>

              <div className="summary-row discount">
                <span>Giảm giá</span>
                <span className="discount-amount">- 0 ₫</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Tổng cộng</span>
                <strong>{getCartTotal().toLocaleString('vi-VN')} ₫</strong>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-checkout-main">
              💳 Tiến hành thanh toán
            </button>

            <button onClick={handleClearCart} className="btn-clear-cart-page">
              🗑️ Xóa toàn bộ giỏ hàng
            </button>
          </div>

          <div className="cart-benefits">
            <h4>🎁 Ưu đãi của bạn</h4>
            <div className="benefit-item">
              <span className="benefit-icon">🚚</span>
              <div className="benefit-info">
                <div className="benefit-title">Miễn phí vận chuyển</div>
                <div className="benefit-desc">Cho đơn hàng từ 0đ</div>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">↩️</span>
              <div className="benefit-info">
                <div className="benefit-title">Đổi trả miễn phí</div>
                <div className="benefit-desc">Trong vòng 7 ngày</div>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✅</span>
              <div className="benefit-info">
                <div className="benefit-title">Hàng chính hãng</div>
                <div className="benefit-desc">Cam kết 100%</div>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h4>💳 Phương thức thanh toán</h4>
            <div className="payment-icons">
              <div className="payment-method-item">💵 COD</div>
              <div className="payment-method-item">🏦 Ngân hàng</div>
              <div className="payment-method-item">📱 MoMo</div>
              <div className="payment-method-item">💳 Thẻ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;