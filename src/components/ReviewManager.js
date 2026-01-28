import React, { useEffect, useState } from 'react';
import { reviewAdminAPI } from '../services/reviewAdminAPI';
import '../styles/ReviewManager.css';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewAdminAPI.getAllReviews();
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await reviewAdminAPI.approveReview(id);
      loadReviews();
      alert('Đã duyệt đánh giá thành công!');
    } catch (err) {
      alert('Lỗi khi duyệt đánh giá!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) return;
    
    try {
      await reviewAdminAPI.deleteReview(id);
      loadReviews();
      alert('Đã xóa đánh giá thành công!');
    } catch (err) {
      alert('Lỗi khi xóa đánh giá!');
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading) {
    return <div className="review-loading">Đang tải dữ liệu...</div>;
  }

  // Calculate statistics
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.verified).length;
  const pendingReviews = totalReviews - approvedReviews;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  return (
    <div className="review-manager">
      <h2>⭐ Quản lý đánh giá</h2>

      {/* Statistics Cards */}
      <div className="review-stats">
        <div className="stat-card">
          <h3>Tổng đánh giá</h3>
          <div className="stat-value">{totalReviews}</div>
        </div>
        <div className="stat-card">
          <h3>Đã duyệt</h3>
          <div className="stat-value" style={{color: '#27ae60'}}>{approvedReviews}</div>
        </div>
        <div className="stat-card">
          <h3>Chờ duyệt</h3>
          <div className="stat-value" style={{color: '#f39c12'}}>{pendingReviews}</div>
        </div>
        <div className="stat-card">
          <h3>Đánh giá TB</h3>
          <div className="stat-value" style={{color: '#fbbf24'}}>⭐ {averageRating}</div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="review-table-container">
        <table className="review-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Người dùng</th>
              <th>Đánh giá</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-reviews-admin">
                  Chưa có đánh giá nào
                </td>
              </tr>
            ) : (
              reviews.map(r => (
                <tr key={r.id}>
                  <td className="td-review-id">#{r.id}</td>
                  <td className="td-product-name">{r.productName}</td>
                  <td className="td-user-name">{r.userFullName || r.username || 'Người dùng'}</td>
                  <td className="td-rating">
                    <span>⭐ {r.rating}</span>Xóa
                  </td>
                  <td className="review-comment" title={r.comment}>
                    {r.comment}
                  </td>
                  <td>
                    {r.verified ? (
                      <span className="review-status approved">Đã duyệt</span>
                    ) : (
                      <span className="review-status pending">Chờ duyệt</span>
                    )}
                  </td>
                  <td className="td-actions">
                    {!r.verified && (
                      <button
                        type="button"
                        className="btn-approve"
                        onClick={() => handleApprove(r.id)}
                      >
                        ✓ Duyệt
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(r.id)}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewManager;