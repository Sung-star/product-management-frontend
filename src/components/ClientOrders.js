import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useToast } from './Toast';
import Footer from './Footer';
// Đã xóa import getOrderItemImage cũ để dùng hàm mới chuẩn hơn
import {
  HiOutlineArrowLeft,
  HiOutlineCube,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineClipboardList,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineCreditCard,
  HiOutlineShoppingBag
} from 'react-icons/hi';
import '../styles/ClientOrders.css';

const ClientOrders = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // --- HÀM XỬ LÝ ẢNH MỚI (Dựa trên ProductCard) ---
  const getMainImage = (item) => {
    // Ưu tiên lấy imageUrl lưu trong OrderItem, nếu không có thì lấy từ product gốc
    let imageSource = item.imageUrl || item.imageUrls || item.product?.imageUrls;
    let finalUrl = '';

    if (imageSource) {
      // Trường hợp 1: Là mảng (Array) -> Lấy phần tử đầu tiên
      if (Array.isArray(imageSource) && imageSource.length > 0) {
        finalUrl = imageSource[0];
      } 
      // Trường hợp 2: Là chuỗi (String) -> Cắt dấu phẩy và lấy cái đầu
      else if (typeof imageSource === 'string') {
        finalUrl = imageSource.split(',')[0].trim();
      }
    }

    // Nếu vẫn không có ảnh -> Trả về ảnh mặc định
    if (!finalUrl) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
    }

    // Thêm prefix localhost nếu chưa có http
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('data:')) {
      return `http://localhost:8080${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
    }

    return finalUrl;
  };
  // ------------------------------------------------

  const ORDER_STATUS = {
    PENDING: { text: 'Chờ xử lý', color: '#f59e0b', icon: HiOutlineClock },
    CONFIRMED: { text: 'Đã xác nhận', color: '#3b82f6', icon: HiOutlineCheckCircle },
    PROCESSING: { text: 'Đang xử lý', color: '#8b5cf6', icon: HiOutlineClock },
    SHIPPING: { text: 'Đang giao', color: '#06b6d4', icon: HiOutlineTruck },
    DELIVERED: { text: 'Đã giao', color: '#22c55e', icon: HiOutlineCube },
    CANCELLED: { text: 'Đã hủy', color: '#ef4444', icon: HiOutlineXCircle },
    RETURNED: { text: 'Đã trả hàng', color: '#6b7280', icon: HiOutlineXCircle }
  };

  const PAYMENT_STATUS = {
    UNPAID: { text: 'Chưa thanh toán', color: '#f59e0b' },
    PAID: { text: 'Đã thanh toán', color: '#22c55e' },
    REFUNDED: { text: 'Đã hoàn tiền', color: '#6b7280' }
  };

  const PAYMENT_METHOD = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    MOMO: 'Ví MoMo',
    VNPAY: 'VNPay',
    CREDIT_CARD: 'Thẻ tín dụng'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      
      const userOrders = user.email 
        ? response.data.filter(order => order.customerEmail === user.email)
        : response.data;
      
      userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(userOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      addToast('Không thể tải danh sách đơn hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (err) {
      addToast('Không thể tải chi tiết đơn hàng!', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      try {
        await orderAPI.cancelOrder(orderId);
        addToast('Đã hủy đơn hàng thành công!', 'success');
        fetchOrders();
        if (showDetailModal && selectedOrder?.id === orderId) {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }
      } catch (err) {
        addToast(err.response?.data || 'Không thể hủy đơn hàng!', 'error');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusStats = () => {
    return {
      all: orders.length,
      PENDING: orders.filter(o => o.status === 'PENDING').length,
      CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
      SHIPPING: orders.filter(o => o.status === 'SHIPPING').length,
      DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter(o => o.status === 'CANCELLED').length
    };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="client-orders">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải đơn hàng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <div className="client-orders">
        {/* Header */}
        <div className="orders-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <HiOutlineArrowLeft /> Quay lại
          </button>
          <div className="header-content">
            <h1><HiOutlineCube /> Đơn Hàng Của Tôi</h1>
            <p className="header-subtitle">Quản lý và theo dõi đơn hàng</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs">
          <button
            className={`status-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <HiOutlineClipboardList className="tab-icon" />
            <span className="tab-text">Tất cả</span>
            <span className="tab-count">{stats.all}</span>
          </button>
          <button
            className={`status-tab ${filterStatus === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            <HiOutlineClock className="tab-icon" />
            <span className="tab-text">Chờ xử lý</span>
            {stats.PENDING > 0 && <span className="tab-count">{stats.PENDING}</span>}
          </button>
          <button
            className={`status-tab ${filterStatus === 'CONFIRMED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('CONFIRMED')}
          >
            <HiOutlineCheckCircle className="tab-icon" />
            <span className="tab-text">Đã xác nhận</span>
            {stats.CONFIRMED > 0 && <span className="tab-count">{stats.CONFIRMED}</span>}
          </button>
          <button
            className={`status-tab ${filterStatus === 'SHIPPING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('SHIPPING')}
          >
            <HiOutlineTruck className="tab-icon" />
            <span className="tab-text">Đang giao</span>
            {stats.SHIPPING > 0 && <span className="tab-count">{stats.SHIPPING}</span>}
          </button>
          <button
            className={`status-tab ${filterStatus === 'DELIVERED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('DELIVERED')}
          >
            <HiOutlineCube className="tab-icon" />
            <span className="tab-text">Đã giao</span>
            {stats.DELIVERED > 0 && <span className="tab-count">{stats.DELIVERED}</span>}
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <HiOutlineCube className="empty-icon" />
              <h3>Chưa có đơn hàng nào</h3>
              <p>
                {filterStatus === 'all' 
                  ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
                  : `Không có đơn hàng nào ở trạng thái "${ORDER_STATUS[filterStatus]?.text}"`
                }
              </p>
              <button className="btn-shop-now" onClick={() => navigate('/')}>
                <HiOutlineShoppingBag /> Mua sắm ngay
              </button>
            </div>
          ) : (
            filteredOrders.map(order => {
              const status = ORDER_STATUS[order.status];
              const paymentStatus = PAYMENT_STATUS[order.paymentStatus];
              const StatusIcon = status?.icon || HiOutlineClock;
              
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-id">
                      <span className="order-label">Mã đơn:</span>
                      <span className="order-value">#{order.id}</span>
                    </div>
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                  </div>

                  <div className="order-card-body">
                    <div className="order-items-preview">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="order-item-mini">
                          <img 
                            src={getMainImage(item)} 
                            alt={item.productName}
                            className="product-image"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                            }}
                          />
                          <div className="item-info">
                            <span className="item-name">{item.productName}</span>
                            <span className="item-qty">x{item.quantity}</span>
                          </div>
                          <span className="item-price">{formatCurrency(item.subtotal)}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="more-items">
                          +{order.items.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>

                    <div className="order-summary-mini">
                      <div className="summary-row">
                        <span>Tổng tiền:</span>
                        <strong className="total-amount">{formatCurrency(order.totalAmount)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Thanh toán:</span>
                        <span style={{ color: paymentStatus?.color, fontWeight: '500' }}>
                          {paymentStatus?.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <div className="order-status-badge" style={{ backgroundColor: status?.color }}>
                      <StatusIcon />
                      <span>{status?.text}</span>
                    </div>
                    
                    <div className="order-actions">
                      <button
                        className="btn-view-detail"
                        onClick={() => viewOrderDetails(order.id)}
                      >
                        <HiOutlineEye /> Chi tiết
                      </button>
                      {order.status === 'PENDING' && (
                        <button
                          className="btn-cancel-order"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <HiOutlineX /> Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HiOutlineCube /> Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <HiOutlineX />
              </button>
            </div>

            <div className="modal-body">
              {/* Order Status Timeline */}
              <div className="detail-section">
                <div className="status-timeline">
                  <div className={`timeline-step ${['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                    <div className="step-icon"><HiOutlineClock /></div>
                    <div className="step-label">Chờ xử lý</div>
                  </div>
                  <div className={`timeline-step ${['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                    <div className="step-icon"><HiOutlineCheckCircle /></div>
                    <div className="step-label">Đã xác nhận</div>
                  </div>
                  <div className={`timeline-step ${['SHIPPING', 'DELIVERED'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                    <div className="step-icon"><HiOutlineTruck /></div>
                    <div className="step-label">Đang giao</div>
                  </div>
                  <div className={`timeline-step ${selectedOrder.status === 'DELIVERED' ? 'completed' : ''}`}>
                    <div className="step-icon"><HiOutlineCube /></div>
                    <div className="step-label">Đã giao</div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="detail-section">
                <h4><HiOutlineUser /> Thông tin người nhận</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label"><HiOutlineUser /> Họ tên:</span>
                    <span className="info-value">{selectedOrder.customerName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><HiOutlineMail /> Email:</span>
                    <span className="info-value">{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label"><HiOutlinePhone /> Số điện thoại:</span>
                    <span className="info-value">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="info-label"><HiOutlineLocationMarker /> Địa chỉ:</span>
                    <span className="info-value">{selectedOrder.shippingAddress}</span>
                  </div>
                  {selectedOrder.note && (
                    <div className="info-item full-width">
                      <span className="info-label">Ghi chú:</span>
                      <span className="info-value">{selectedOrder.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="detail-section">
                <h4><HiOutlineShoppingBag /> Sản phẩm</h4>
                <div className="detail-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="detail-item">
                      <img 
                        src={getMainImage(item)} 
                        alt={item.productName}
                        className="detail-product-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
                        }}
                      />
                      <div className="detail-item-content">
                        <div className="item-main">
                          <span className="item-name">{item.productName}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                        <div className="item-prices">
                          <span className="item-unit-price">{formatCurrency(item.productPrice)}</span>
                          <strong className="item-subtotal">{formatCurrency(item.subtotal)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="detail-section">
                <h4><HiOutlineCreditCard /> Thanh toán</h4>
                <div className="payment-info">
                  <div className="payment-row">
                    <span>Phương thức:</span>
                    <span>{PAYMENT_METHOD[selectedOrder.paymentMethod]}</span>
                  </div>
                  <div className="payment-row">
                    <span>Trạng thái:</span>
                    <span style={{ color: PAYMENT_STATUS[selectedOrder.paymentStatus]?.color, fontWeight: '500' }}>
                      {PAYMENT_STATUS[selectedOrder.paymentStatus]?.text}
                    </span>
                  </div>
                  <div className="payment-row total">
                    <span>Tổng cộng:</span>
                    <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === 'PENDING' && (
                <button
                  className="btn-cancel-order-modal"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  <HiOutlineX /> Hủy đơn hàng
                </button>
              )}
              <button className="btn-close-modal" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ClientOrders;