import React, { useState } from 'react';
import '../styles/ProductFilter.css';

const ProductFilter = ({ categories, onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    sortBy: 'default',
    priceRange: 'all',
    stockStatus: 'all'
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: '',
      categoryId: 'all',
      sortBy: 'default',
      priceRange: 'all',
      stockStatus: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="product-filter">
      <div className="filter-row">
        <div className="filter-search">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm sản phẩm..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>

        <button className="btn-reset-filter" onClick={resetFilters}>
          🔄 Đặt lại
        </button>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>📂 Danh mục</label>
          <select
            value={filters.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
          >
            <option value="all">Tất cả</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>🔽 Sắp xếp</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A → Z</option>
            <option value="name-desc">Tên Z → A</option>
            <option value="newest">Mới nhất</option>
          </select>
        </div>

        <div className="filter-group">
          <label>💰 Khoảng giá</label>
          <select
            value={filters.priceRange}
            onChange={(e) => handleChange('priceRange', e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="under-500k">Dưới 500K</option>
            <option value="500k-1m">500K - 1M</option>
            <option value="1m-5m">1M - 5M</option>
            <option value="5m-10m">5M - 10M</option>
            <option value="over-10m">Trên 10M</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📦 Tình trạng</label>
          <select
            value={filters.stockStatus}
            onChange={(e) => handleChange('stockStatus', e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="in-stock">Còn hàng</option>
            <option value="low-stock">Sắp hết</option>
            <option value="out-of-stock">Hết hàng</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;