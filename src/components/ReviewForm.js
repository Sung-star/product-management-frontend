import React, { useState } from 'react';
import { reviewAPI } from '../services/reviewAPI';
import StarRating from './StarRating';
import '../styles/ReviewForm.css';

const ReviewForm = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    try {
      setLoading(true);

      await reviewAPI.createReview({
        productId,
        rating,
        comment
      });

      setComment('');
      setRating(5);
      onSuccess();
      alert('Đánh giá thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form">
      <h4>✍️ Viết đánh giá của bạn</h4>

      <div className="review-form-group">
        <label>Đánh giá của bạn</label>
        <select
          className="review-rating-select"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {'⭐'.repeat(n)} ({n} sao)
            </option>
          ))}
        </select>

        <div className="review-star-preview">
          <StarRating value={rating} />
          <span>({rating}/5 sao)</span>
        </div>
      </div>

      <div className="review-form-group">
        <label>Nhận xét của bạn</label>
        <textarea
          className="review-textarea"
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <div className="review-char-count">
          {comment.length}/500 ký tự
        </div>
      </div>

      <button 
        className="review-submit-btn"
        onClick={submitReview} 
        disabled={loading || !comment.trim()}
      >
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </div>
  );
};

export default ReviewForm;