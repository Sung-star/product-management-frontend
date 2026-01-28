import React from 'react';
import StarRating from './StarRating';
import '../styles/ReviewList.css';

const ReviewList = ({ reviews }) => {
  if (!reviews.length) {
    return (
      <div className="review-list-container">
        <h3>📝 Đánh giá sản phẩm</h3>
        <p className="no-reviews">Chưa có đánh giá nào.</p>
      </div>
    );
  }

  // Get first letter for avatar
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="review-list-container">
      <h3>📝 Đánh giá sản phẩm ({reviews.length})</h3>

      {reviews.map((r) => (
        <div key={r.id} className="review-item">
          <div className="review-header">
            <div className="review-user-info">
              <div className="review-user-avatar">
                {getInitial(r.userFullName || r.username)}
              </div>
              <div>
                <div className="review-user-name">
                  {r.userFullName || r.username || 'Người dùng'}
                </div>
                <div className="review-rating">
                  <StarRating value={r.rating} />
                </div>
              </div>
            </div>

            <div className="review-footer">
              <small className="review-date">
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString('vi-VN')
                  : ''}
              </small>
              {r.verified && (
                <span className="review-verified-badge">✓ Đã duyệt</span>
              )}
            </div>
          </div>

          {r.comment && (
            <p className="review-comment">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;