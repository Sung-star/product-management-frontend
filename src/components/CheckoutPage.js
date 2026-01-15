import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { orderAPI } from '../services/api'; 
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'cod', // ✅ lowercase để match với mapping
    shippingMethod: 'standard'
  });

  const [errors, setErrors] = useState({});

  // ✅ LOAD USER DATA KHI COMPONENT MOUNT
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 User from localStorage:', user);
    
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || user.username || '',
        email: user.email || '',
        // ❌ phone phải user tự điền vì backend không có field này
      }));
    }
  }, []);

  // ✅ THÊM useEffect RIÊNG ĐỂ CHECK CART
  useEffect(() => {
    if (cart.length === 0 && step !== 4) {
      navigate('/cart');
    }
  }, [cart, navigate, step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) {
      addToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateShippingFee = () => {
    if (formData.shippingMethod === 'express') return 50000;
    if (formData.shippingMethod === 'fast') return 30000;
    return 0;
  };

  const getTotalAmount = () => {
    return getCartTotal() + calculateShippingFee();
  };

  const mapPaymentMethod = (method) => {
    const mapping = {
      'cod': 'CASH',
      'bank': 'BANK_TRANSFER',
      'momo': 'MOMO',
      'card': 'CREDIT_CARD'
    };
    const mapped = mapping[method.toLowerCase()] || 'CASH';
    console.log(`Mapping payment method: ${method} → ${mapped}`);
    return mapped;
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      // ✅ VALIDATE TRƯỚC KHI GỌI API
      console.log('🔍 Current formData:', formData);
      
      if (!formData.fullName || !formData.fullName.trim()) {
        addToast('Vui lòng nhập họ tên!', 'error');
        setStep(1);
        setLoading(false);
        return;
      }
      
      if (!formData.email || !formData.email.trim()) {
        addToast('Vui lòng nhập email!', 'error');
        setStep(1);
        setLoading(false);
        return;
      }
      
      if (!formData.phone || !formData.phone.trim()) {
        addToast('Vui lòng nhập số điện thoại!', 'error');
        setStep(1);
        setLoading(false);
        return;
      }
      
      if (!formData.address || !formData.address.trim()) {
        addToast('Vui lòng nhập địa chỉ!', 'error');
        setStep(1);
        setLoading(false);
        return;
      }
      
      if (!formData.city || !formData.city.trim()) {
        addToast('Vui lòng chọn tỉnh/thành phố!', 'error');
        setStep(1);
        setLoading(false);
        return;
      }

      const fullAddress = [
        formData.address,
        formData.ward,
        formData.district,
        formData.city
      ].filter(Boolean).join(', ');

      const orderPayload = {
        customerName: formData.fullName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: fullAddress,
        paymentMethod: mapPaymentMethod(formData.paymentMethod),
        note: formData.note ? formData.note.trim() : null,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity
        }))
      };

      console.log('📤 Order Payload:', JSON.stringify(orderPayload, null, 2));

      const response = await orderAPI.createOrder(orderPayload);
      
      console.log('✅ Order Response:', response.data);

      setCreatedOrderId(response.data.id);
      clearCart();
      setStep(4);
      addToast('Đặt hàng thành công!', 'success');

    } catch (error) {
      console.error('❌ Order Error:', error);
      
      let errorMessage = 'Đặt hàng thất bại. Vui lòng thử lại!';
      
      if (error.response) {
        console.error('Backend Error:', error.response.data);
        errorMessage = error.response.data.message || error.response.data || errorMessage;
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến máy chủ!';
      }
      
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
        <div className="step-number">{step > 1 ? '✓' : '1'}</div>
        <div className="step-label">Thông tin</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
        <div className="step-number">{step > 2 ? '✓' : '2'}</div>
        <div className="step-label">Thanh toán</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
        <div className="step-number">{step > 3 ? '✓' : '3'}</div>
        <div className="step-label">Xác nhận</div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="checkout-step">
      <h2>📝 Thông tin giao hàng</h2>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className={errors.fullName ? 'error' : ''}
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Số điện thoại *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0123456789"
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group full-width">
          <label>Địa chỉ *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Số nhà, tên đường"
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        <div className="form-group">
          <label>Tỉnh/Thành phố *</label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? 'error' : ''}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Cần Thơ">Cần Thơ</option>
            <option value="Hải Phòng">Hải Phòng</option>
          </select>
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label>Quận/Huyện</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Quận/Huyện"
          />
        </div>

        <div className="form-group full-width">
          <label>Phường/Xã</label>
          <input
            type="text"
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            placeholder="Phường/Xã"
          />
        </div>

        <div className="form-group full-width">
          <label>Ghi chú đơn hàng</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="checkout-step">
      <h2>💳 Phương thức thanh toán</h2>
      
      <div className="payment-methods">
        <div
          className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
        >
          <div className="payment-icon">💵</div>
          <div className="payment-info">
            <div className="payment-name">Thanh toán khi nhận hàng (COD)</div>
            <div className="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</div>
          </div>
          <div className="payment-radio">
            {formData.paymentMethod === 'cod' && '✓'}
          </div>
        </div>

        <div
          className={`payment-option ${formData.paymentMethod === 'bank' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'bank' }))}
        >
          <div className="payment-icon">🏦</div>
          <div className="payment-info">
            <div className="payment-name">Chuyển khoản ngân hàng</div>
            <div className="payment-desc">Chuyển khoản qua tài khoản ngân hàng</div>
          </div>
          <div className="payment-radio">
            {formData.paymentMethod === 'bank' && '✓'}
          </div>
        </div>

        <div
          className={`payment-option ${formData.paymentMethod === 'momo' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'momo' }))}
        >
          <div className="payment-icon">📱</div>
          <div className="payment-info">
            <div className="payment-name">Ví MoMo</div>
            <div className="payment-desc">Thanh toán qua ví điện tử MoMo</div>
          </div>
          <div className="payment-radio">
            {formData.paymentMethod === 'momo' && '✓'}
          </div>
        </div>

        <div
          className={`payment-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
        >
          <div className="payment-icon">💳</div>
          <div className="payment-info">
            <div className="payment-name">Thẻ tín dụng/ghi nợ</div>
            <div className="payment-desc">Visa, MasterCard, JCB</div>
          </div>
          <div className="payment-radio">
            {formData.paymentMethod === 'card' && '✓'}
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '40px' }}>🚚 Phương thức vận chuyển</h2>
      
      <div className="shipping-methods">
        <div
          className={`shipping-option ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, shippingMethod: 'standard' }))}
        >
          <div className="shipping-info">
            <div className="shipping-name">🚚 Giao hàng tiêu chuẩn</div>
            <div className="shipping-desc">Giao hàng trong 3-5 ngày</div>
          </div>
          <div className="shipping-price">Miễn phí</div>
        </div>

        <div
          className={`shipping-option ${formData.shippingMethod === 'fast' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, shippingMethod: 'fast' }))}
        >
          <div className="shipping-info">
            <div className="shipping-name">⚡ Giao hàng nhanh</div>
            <div className="shipping-desc">Giao hàng trong 1-2 ngày</div>
          </div>
          <div className="shipping-price">30.000 ₫</div>
        </div>

        <div
          className={`shipping-option ${formData.shippingMethod === 'express' ? 'selected' : ''}`}
          onClick={() => setFormData(prev => ({ ...prev, shippingMethod: 'express' }))}
        >
          <div className="shipping-info">
            <div className="shipping-name">🚀 Giao hàng hỏa tốc</div>
            <div className="shipping-desc">Giao hàng trong 2-4 giờ</div>
          </div>
          <div className="shipping-price">50.000 ₫</div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="checkout-step">
      <h2>✅ Xác nhận đơn hàng</h2>
      
      <div className="review-section">
        <div className="review-card">
          <h3>📦 Thông tin giao hàng</h3>
          <div className="review-info">
            <p><strong>Người nhận:</strong> {formData.fullName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Số điện thoại:</strong> {formData.phone}</p>
            <p><strong>Địa chỉ:</strong> {formData.address}, {formData.ward}, {formData.district}, {formData.city}</p>
            {formData.note && <p><strong>Ghi chú:</strong> {formData.note}</p>}
          </div>
        </div>

        <div className="review-card">
          <h3>💳 Phương thức thanh toán</h3>
          <div className="review-info">
            <p>
              {formData.paymentMethod === 'cod' && '💵 Thanh toán khi nhận hàng (COD)'}
              {formData.paymentMethod === 'bank' && '🏦 Chuyển khoản ngân hàng'}
              {formData.paymentMethod === 'momo' && '📱 Ví MoMo'}
              {formData.paymentMethod === 'card' && '💳 Thẻ tín dụng/ghi nợ'}
            </p>
          </div>
        </div>

        <div className="review-card">
          <h3>🚚 Phương thức vận chuyển</h3>
          <div className="review-info">
            <p>
              {formData.shippingMethod === 'standard' && '🚚 Giao hàng tiêu chuẩn (3-5 ngày) - Miễn phí'}
              {formData.shippingMethod === 'fast' && '⚡ Giao hàng nhanh (1-2 ngày) - 30.000 ₫'}
              {formData.shippingMethod === 'express' && '🚀 Giao hàng hỏa tốc (2-4 giờ) - 50.000 ₫'}
            </p>
          </div>
        </div>

        <div className="review-card">
          <h3>🛒 Sản phẩm đã chọn</h3>
          <div className="review-products">
            {cart.map(item => (
              <div key={item.id} className="review-product-item">
                <img
                  src={item.imageUrls?.[0] ? `http://localhost:8080${item.imageUrls[0]}` : '/no-image.png'}
                  alt={item.name}
                />
                <div className="review-product-info">
                  <div className="review-product-name">{item.name}</div>
                  <div className="review-product-qty">Số lượng: {item.cartQuantity}</div>
                </div>
                <div className="review-product-price">
                  {(item.price * item.cartQuantity).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="success-container">
      <div className="success-icon">🎉</div>
      <h1>Đặt hàng thành công!</h1>
      <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
      
      <div className="success-info">
        <div className="success-item">
          <span className="success-label">Mã đơn hàng:</span>
          <span className="success-value">#{createdOrderId || 'N/A'}</span>
        </div>
        <div className="success-item">
          <span className="success-label">Tổng tiền:</span>
          <span className="success-value">{getTotalAmount().toLocaleString('vi-VN')} ₫</span>
        </div>
      </div>

      <div className="success-actions">
        <button onClick={() => navigate('/orders')} className="btn-view-orders">
          📦 Xem đơn hàng
        </button>
        <button onClick={() => navigate('/')} className="btn-continue-shopping-success">
          🛍️ Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );

  if (step === 4) {
    return <div className="checkout-page">{renderStep4()}</div>;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="btn-back-checkout" onClick={() => navigate('/cart')}>
          ← Quay lại giỏ hàng
        </button>

        {renderStepIndicator()}

        <div className="checkout-content">
          <div className="checkout-main">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="checkout-actions">
              {step > 1 && (
                <button onClick={handlePrevStep} className="btn-prev">
                  ← Quay lại
                </button>
              )}
              {step < 3 ? (
                <button onClick={handleNextStep} className="btn-next">
                  Tiếp tục →
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="btn-place-order"
                  disabled={loading}
                >
                  {loading ? '⏳ Đang xử lý...' : '🎉 Đặt hàng'}
                </button>
              )}
            </div>
          </div>

          <div className="checkout-sidebar">
            <div className="order-summary">
              <h3>📋 Tóm tắt đơn hàng</h3>
              
              <div className="summary-items">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <span className="item-name">
                      {item.name} x{item.cartQuantity}
                    </span>
                    <span className="item-price">
                      {(item.price * item.cartQuantity).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{getCartTotal().toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>{calculateShippingFee() === 0 ? 'Miễn phí' : calculateShippingFee().toLocaleString('vi-VN') + ' ₫'}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Tổng cộng</span>
                <strong>{getTotalAmount().toLocaleString('vi-VN')} ₫</strong>
              </div>
            </div>

            <div className="checkout-features">
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>Miễn phí đổi trả trong 7 ngày</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Thanh toán an toàn & bảo mật</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💯</span>
                <span>Cam kết hàng chính hãng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;