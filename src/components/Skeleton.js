import React from 'react';
import '../styles/Skeleton.css';

export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="skeleton-footer">
          <div className="skeleton-price"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export const SkeletonDetail = () => {
  return (
    <div className="skeleton-detail">
      <div className="skeleton-detail-gallery">
        <div className="skeleton-main-image"></div>
        <div className="skeleton-thumbnails">
          <div className="skeleton-thumbnail"></div>
          <div className="skeleton-thumbnail"></div>
          <div className="skeleton-thumbnail"></div>
        </div>
      </div>
      <div className="skeleton-detail-info">
        <div className="skeleton-title large"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-price large"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-buttons">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;