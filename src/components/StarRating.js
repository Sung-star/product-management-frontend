import React from 'react';
import '../styles/Review.css';

const StarRating = ({ value = 0, size = 20 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={i <= value ? 'star filled' : 'star'}
        style={{ fontSize: size }}
      >
        ★
      </span>
    );
  }

  return <div className="star-rating">{stars}</div>;
};

export default StarRating;
