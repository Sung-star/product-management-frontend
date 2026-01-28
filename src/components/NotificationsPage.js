import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useToast } from './Toast';
import Footer from './Footer';
import {
  HiOutlineBell,
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineX,
  HiOutlineGift,
  HiOutlineInformationCircle,
  HiOutlineRefresh
} from 'react-icons/hi';
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  useEffect(() => {
    if (!user.id) {
      addToast('Vui lòng đăng nhập!', 'error');
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user.id, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = filter === 'unread' 
        ? await notificationAPI.getUnreadNotifications(user.id)
        : await notificationAPI.getUserNotifications(user.id);
      setNotifications(response.data);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      addToast('Không thể tải thông báo!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Mark as read error:', err);
      addToast('Không thể đánh dấu đã đọc!', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      addToast('Đã đánh dấu tất cả là đã đọc!', 'success');
    } catch (err) {
      console.error('Mark all as read error:', err);
      addToast('Không thể đánh dấu tất cả!', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;

    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      addToast('Đã xóa thông báo!', 'success');
    } catch (err) {
      console.error('Delete notification error:', err);
      addToast('Không thể xóa thông báo!', 'error');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.relatedId) {
      switch (notification.type) {
        case 'ORDER_CREATED':
        case 'ORDER_CONFIRMED':
        case 'ORDER_SHIPPING':
        case 'ORDER_DELIVERED':
        case 'ORDER_CANCELLED':
          navigate(`/orders/${notification.relatedId}`);
          break;
        case 'PRODUCT_RESTOCK':
          navigate(`/product/${notification.relatedId}`);
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <HiOutlineCube className="icon-order" />;
      case 'ORDER_CONFIRMED':
        return <HiOutlineCheckCircle className="icon-confirmed" />;
      case 'ORDER_SHIPPING':
        return <HiOutlineTruck className="icon-shipping" />;
      case 'ORDER_DELIVERED':
        return <HiOutlineCheckCircle className="icon-delivered" />;
      case 'ORDER_CANCELLED':
        return <HiOutlineX className="icon-cancelled" />;
      case 'PROMOTION':
        return <HiOutlineGift className="icon-promotion" />;
      case 'PRODUCT_RESTOCK':
        return <HiOutlineRefresh className="icon-restock" />;
      case 'SYSTEM':
      default:
        return <HiOutlineInformationCircle className="icon-system" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="notifications-header">
            <button className="btn-back" onClick={() => navigate('/profile')}>
              <HiOutlineArrowLeft /> Quay lại
            </button>
            <h1>
              <HiOutlineBell /> Thông báo
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </h1>
          </div>

          <div className="notifications-controls">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
                <HiOutlineCheckCircle /> Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <HiOutlineBell className="empty-icon" />
              <h2>Không có thông báo</h2>
              <p>
                {filter === 'unread'
                  ? 'Bạn đã đọc hết tất cả thông báo!'
                  : 'Bạn chưa có thông báo nào.'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="btn-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Đánh dấu đã đọc"
                      >
                        <HiOutlineCheckCircle />
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      title="Xóa"
                    >
                      <HiOutlineTrash />
                    </button>
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

export default NotificationsPage;