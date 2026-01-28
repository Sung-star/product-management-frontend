import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useToast } from './Toast';
import { 
  HiOutlineSearch, 
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineShoppingCart,
  HiOutlineCog,
  HiOutlineTrash 
} from 'react-icons/hi';
import '../styles/OrderManager.css';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToast } = useToast();

  const ORDER_STATUS = {
    PENDING: { text: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' },
    CONFIRMED: { text: 'Đã xác nhận', color: '#3b82f6', bg: '#dbeafe' },
    PROCESSING: { text: 'Đang xử lý', color: '#8b5cf6', bg: '#ede9fe' },
    SHIPPING: { text: 'Đang giao', color: '#06b6d4', bg: '#cffafe' },
    DELIVERED: { text: 'Đã giao', color: '#22c55e', bg: '#dcfce7' },
    CANCELLED: { text: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
    RETURNED: { text: 'Đã trả hàng', color: '#6b7280', bg: '#f3f4f6' }
  };

  const PAYMENT_STATUS = {
    UNPAID: { text: 'Chưa thanh toán', color: '#f59e0b', bg: '#fef3c7' },
    PAID: { text: 'Đã thanh toán', color: '#22c55e', bg: '#dcfce7' },
    REFUNDED: { text: 'Đã hoàn tiền', color: '#6b7280', bg: '#f3f4f6' }
  };

  const PAYMENT_METHOD = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    MOMO: 'Ví MoMo',
    VNPAY: 'VNPay',
    CREDIT_CARD: 'Thẻ tín dụng',
    E_WALLET: 'Ví điện tử'
  };

  // --- HÀM XỬ LÝ ẢNH ---
  const getMainImage = (item) => {
    let imageSource = item.imageUrl || item.imageUrls || item.product?.imageUrls;
    let finalUrl = '';

    if (imageSource) {
      if (Array.isArray(imageSource) && imageSource.length > 0) {
        finalUrl = imageSource[0];
      } else if (typeof imageSource === 'string') {
        finalUrl = imageSource.split(',')[0].trim();
      }
    }

    if (!finalUrl) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
    }

    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('data:')) {
      return `http://localhost:8080${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
    }
    return finalUrl;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng');
      addToast('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    addToast('Đang tải lại...', 'info');
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      addToast('Cập nhật trạng thái thành công!', 'success');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        const response = await orderAPI.getOrderById(orderId);
        setSelectedOrder(response.data);
      }
    } catch (err) {
      addToast('Lỗi khi cập nhật trạng thái!', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updatePaymentStatus(orderId, newStatus);
      addToast('Cập nhật thanh toán thành công!', 'success');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        const response = await orderAPI.getOrderById(orderId);
        setSelectedOrder(response.data);
      }
    } catch (err) {
      addToast('Lỗi khi cập nhật!', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      try {
        await orderAPI.cancelOrder(orderId);
        addToast('Đã hủy đơn hàng!', 'success');
        fetchOrders();
        if (showDetailModal && selectedOrder?.id === orderId) {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }
      } catch (err) {
        addToast(err.response?.data || 'Lỗi khi hủy đơn hàng!', 'error');
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng này không?\nHành động này không thể hoàn tác!')) {
      try {
        await orderAPI.deleteOrder(orderId); 
        addToast('Đã xóa đơn hàng vĩnh viễn!', 'success');
        fetchOrders();
        if (showDetailModal && selectedOrder?.id === orderId) {
          setShowDetailModal(false);
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error(err);
        addToast('Chưa hỗ trợ xóa vĩnh viễn, đã hủy đơn!', 'info');
        handleCancelOrder(orderId);
      }
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      const response = await orderAPI.getOrderById(order.id);
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (err) {
      addToast('Lỗi khi tải chi tiết đơn hàng!', 'error');
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
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const stats = {
    revenue: orders
      .filter(o => o.status === 'DELIVERED' && o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0),
    pending: orders.filter(o => o.status === 'PENDING').length,
    shipping: orders.filter(o => o.status === 'SHIPPING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    unpaid: orders.filter(o => o.paymentStatus === 'UNPAID').length
  };

  const filteredOrders = orders.filter(order => {
    const keyword = searchKeyword.toLowerCase().trim();
    const matchSearch = keyword === '' || 
      order.customerName?.toLowerCase().includes(keyword) ||
      order.customerEmail?.toLowerCase().includes(keyword) ||
      order.customerPhone?.includes(keyword) ||
      order.id.toString().includes(keyword);
    
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
    
    return matchSearch && matchStatus && matchPayment;
  });

  if (loading && orders.length === 0) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="order-manager-admin">
      {/* ✅ HEADER TRANG ĐỒNG BỘ */}
      <div className="admin-page-header">
         <h2 className="page-title"><HiOutlineClipboardList /> Quản lý đơn hàng</h2>
         <p className="page-subtitle">Xem và quản lý tất cả đơn hàng của hệ thống</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics */}
      <div className="admin-stats-grid">
         <div className="stat-card stat-revenue">
          <div className="stat-icon"><HiOutlineCurrencyDollar /></div>
          <div className="stat-content">
            <span className="stat-label">Doanh thu</span>
            <span className="stat-value">{formatCurrency(stats.revenue)}</span>
          </div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-icon"><HiOutlineClock /></div>
          <div className="stat-content">
            <span className="stat-label">Chờ xử lý</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card stat-shipping">
          <div className="stat-icon"><HiOutlineTruck /></div>
          <div className="stat-content">
            <span className="stat-label">Đang giao</span>
            <span className="stat-value">{stats.shipping}</span>
          </div>
        </div>
        <div className="stat-card stat-delivered">
          <div className="stat-icon"><HiOutlineCheckCircle /></div>
          <div className="stat-content">
            <span className="stat-label">Đã giao</span>
            <span className="stat-value">{stats.delivered}</span>
          </div>
        </div>
        <div className="stat-card stat-unpaid">
          <div className="stat-icon"><HiOutlineCreditCard /></div>
          <div className="stat-content">
            <span className="stat-label">Chưa thanh toán</span>
            <span className="stat-value">{stats.unpaid}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo ID, tên, email, SĐT..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="SHIPPING">Đang giao</option>
          <option value="DELIVERED">Đã giao</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="admin-filter-select"
        >
          <option value="all">Tất cả thanh toán</option>
          <option value="UNPAID">Chưa thanh toán</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
        </select>

        <button type="button" onClick={handleRefresh} className="btn-refresh-admin">
          <HiOutlineRefresh /> <span>Làm mới</span>
        </button>

        <span className="toolbar-info">
          Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng
        </span>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>SẢN PHẨM</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th>THANH TOÁN</th>
              <th>NGÀY ĐẶT</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="empty-state">
                    <HiOutlineShoppingCart className="empty-icon" />
                    <p>Không có đơn hàng nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const status = ORDER_STATUS[order.status] || {};
                const payment = PAYMENT_STATUS[order.paymentStatus] || {};
                
                return (
                  <tr key={order.id} onClick={() => viewOrderDetails(order)}>
                    <td><span className="order-id-badge">#{order.id}</span></td>
                    <td>
                      <div className="customer-info">
                        <strong className="customer-name">{order.customerName}</strong>
                        <span className="customer-phone">{order.customerPhone}</span>
                        <span className="customer-email">{order.customerEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className="products-preview">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="product-mini">
                            <img 
                              src={getMainImage(item)}
                              alt={item.productName}
                              className="product-thumb"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'; }}
                            />
                            <div className="product-mini-info">
                              <span className="product-mini-name">{item.productName}</span>
                              <span className="product-mini-qty">x{item.quantity}</span>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 2 && <span className="more-products">+{order.items.length - 2} SP khác</span>}
                      </div>
                    </td>
                    <td><strong className="total-amount">{formatCurrency(order.totalAmount)}</strong></td>
                    <td>
                      <span className="status-badge-new" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <span className="payment-badge-new" style={{ backgroundColor: payment.bg, color: payment.color }}>
                        {payment.text}
                      </span>
                    </td>
                    <td><span className="date-text">{formatDate(order.createdAt)}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button 
                          type="button"
                          onClick={() => viewOrderDetails(order)} 
                          className="btn-action btn-view"
                          title="Xem chi tiết"
                        >
                          <HiOutlineEye />
                        </button>
                        
                        <button 
                            type="button"
                            className="btn-delete-order-custom"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order.id);
                            }} 
                            title="Xóa đơn hàng"
                        >
                            <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showDetailModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div className="modal-title">
                <h3>Chi tiết đơn hàng</h3>
                <span className="order-id-modal">#{selectedOrder.id}</span>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowDetailModal(false)}>
                <HiOutlineX />
              </button>
            </div>

            <div className="order-modal-body">
              {/* Modal Content - Giữ nguyên như cũ */}
              <div className="modal-grid">
                <div className="order-section">
                  <h4><HiOutlineUser /> Thông tin khách hàng</h4>
                  <div className="info-card">
                    <div className="info-row"><span className="info-label">Họ tên:</span><span className="info-value">{selectedOrder.customerName}</span></div>
                    <div className="info-row"><span className="info-label">SĐT:</span><span className="info-value">{selectedOrder.customerPhone}</span></div>
                    <div className="info-row"><span className="info-label">Email:</span><span className="info-value">{selectedOrder.customerEmail}</span></div>
                    <div className="info-row"><span className="info-label">Địa chỉ:</span><span className="info-value address">{selectedOrder.shippingAddress}</span></div>
                  </div>
                </div>

                <div className="order-section">
                  <h4><HiOutlineClipboardList /> Thông tin đơn hàng</h4>
                  <div className="info-card">
                    <div className="info-row"><span className="info-label">Ngày đặt:</span><span className="info-value">{formatDate(selectedOrder.createdAt)}</span></div>
                    <div className="info-row"><span className="info-label">Thanh toán:</span><span className="info-value">{PAYMENT_METHOD[selectedOrder.paymentMethod]}</span></div>
                    {selectedOrder.note && <div className="info-row"><span className="info-label">Ghi chú:</span><span className="info-value note">{selectedOrder.note}</span></div>}
                  </div>
                </div>
              </div>

              <div className="order-section">
                <h4><HiOutlineShoppingCart /> Sản phẩm ({selectedOrder.items?.length || 0})</h4>
                <div className="order-items-detail">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item-card">
                      <img 
                        src={getMainImage(item)}
                        alt={item.productName}
                        className="item-image"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'; }}
                      />
                      <div className="item-details">
                        <h5 className="item-name">{item.productName}</h5>
                        <div className="item-meta">
                          <span className="item-price">{formatCurrency(item.productPrice)}</span>
                          <span className="item-qty">× {item.quantity}</span>
                        </div>
                      </div>
                      <div className="item-subtotal">{formatCurrency(item.subtotal)}</div>
                    </div>
                  ))}
                </div>
                <div className="order-total-section">
                  <div className="total-row final"><span>Tổng cộng:</span><strong>{formatCurrency(selectedOrder.totalAmount)}</strong></div>
                </div>
              </div>

              <div className="order-section management-section">
                <h4><HiOutlineCog /> Quản lý đơn hàng</h4>
                <div className="status-controls-grid">
                  <div className="control-group">
                    <label>Trạng thái đơn hàng:</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="status-select-admin"
                      disabled={selectedOrder.status === 'CANCELLED'}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="DELIVERED">Đã giao</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <label>Trạng thái thanh toán:</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                      className="status-select-admin"
                    >
                      <option value="UNPAID">Chưa thanh toán</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                  </div>
                </div>
                <div className="quick-actions-modal">
                    {selectedOrder.status === 'PENDING' && (
                        <button type="button" onClick={() => handleUpdateStatus(selectedOrder.id, 'CONFIRMED')} className="btn-quick btn-confirm-quick">
                        <HiOutlineCheckCircle /> Xác nhận đơn
                        </button>
                    )}
                    <button type="button" onClick={() => handleDeleteOrder(selectedOrder.id)} className="btn-quick btn-delete-quick" style={{ background: '#ef4444', color: 'white' }}>
                      <HiOutlineTrash /> Xóa đơn hàng
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;