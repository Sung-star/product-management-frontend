import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useToast } from './Toast';
import '../styles/OrderManager.css';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToast } = useToast();

  const ORDER_STATUS = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy'
  };

  const PAYMENT_STATUS = {
    UNPAID: 'Chưa thanh toán',
    PAID: 'Đã thanh toán',
    REFUNDED: 'Đã hoàn tiền'
  };

  const PAYMENT_METHOD = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'Chuyển khoản',
    CREDIT_CARD: 'Thẻ tín dụng',
    E_WALLET: 'Ví điện tử'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng: ' + err.message);
      addToast('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
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
      addToast('Cập nhật trạng thái thanh toán thành công!', 'success');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        const response = await orderAPI.getOrderById(orderId);
        setSelectedOrder(response.data);
      }
    } catch (err) {
      addToast('Lỗi khi cập nhật trạng thái thanh toán!', 'error');
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
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      SHIPPING: 'status-shipping',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled'
    };
    return colors[status] || '';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      UNPAID: 'payment-unpaid',
      PAID: 'payment-paid',
      REFUNDED: 'payment-refunded'
    };
    return colors[status] || '';
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.customerName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.id.toString().includes(searchKeyword);
    
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchSearch && matchStatus;
  });

  if (loading && orders.length === 0) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="order-manager-admin">
      {error && <div className="error-message">{error}</div>}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="🔍 Tìm đơn hàng theo ID, tên, email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="admin-search-input"
          />
          
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

          <button onClick={fetchOrders} className="btn-refresh-admin">
            🔄 Làm mới
          </button>
        </div>

        <div className="order-stats">
          <span className="stat-item">
            Tổng: <strong>{filteredOrders.length}</strong> đơn
          </span>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="td-id">#{order.id}</td>
                  <td className="td-customer">
                    <div className="customer-info">
                      <strong>{order.customerName}</strong>
                      <small>{order.customerEmail}</small>
                    </div>
                  </td>
                  <td className="td-phone">{order.customerPhone}</td>
                  <td className="td-price">{formatCurrency(order.totalAmount)}</td>
                  <td className="td-status">
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {ORDER_STATUS[order.status]}
                    </span>
                  </td>
                  <td className="td-payment">
                    <span className={`payment-badge ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {PAYMENT_STATUS[order.paymentStatus]}
                    </span>
                  </td>
                  <td className="td-date">{formatDate(order.createdAt)}</td>
                  <td className="td-actions">
                    <button 
                      onClick={() => viewOrderDetails(order)} 
                      className="btn-view-table"
                    >
                      👁️ Xem
                    </button>
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)} 
                        className="btn-delete-table"
                      >
                        ❌ Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>📦 Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="order-modal-body">
              {/* Customer Info */}
              <div className="order-section">
                <h4>👤 Thông tin khách hàng</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ tên:</label>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Địa chỉ giao hàng:</label>
                    <span>{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="order-section">
                <h4>📋 Thông tin đơn hàng</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Phương thức thanh toán:</label>
                    <span>{PAYMENT_METHOD[selectedOrder.paymentMethod]}</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày đặt:</label>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  {selectedOrder.note && (
                    <div className="info-item full-width">
                      <label>Ghi chú:</label>
                      <span>{selectedOrder.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-section">
                <h4>🛒 Sản phẩm</h4>
                <div className="order-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <strong>{item.productName}</strong>
                        <span>Số lượng: {item.quantity}</span>
                      </div>
                      <div className="item-price">
                        <span className="unit-price">{formatCurrency(item.productPrice)}</span>
                        <strong className="subtotal">{formatCurrency(item.subtotal)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Tổng cộng:</span>
                  <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                </div>
              </div>

              {/* Status Management */}
              <div className="order-section">
                <h4>⚙️ Quản lý trạng thái</h4>
                <div className="status-controls">
                  <div className="status-control-item">
                    <label>Trạng thái đơn hàng:</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="status-select"
                      disabled={selectedOrder.status === 'CANCELLED'}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="DELIVERED">Đã giao</option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <div className="status-control-item">
                    <label>Trạng thái thanh toán:</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="UNPAID">Chưa thanh toán</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                  </div>
                </div>

                {selectedOrder.status === 'PENDING' && (
                  <button 
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="btn-cancel-order"
                  >
                    ❌ Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;