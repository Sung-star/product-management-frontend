import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductForm from '../components/ProductForm'; // Lưu ý đường dẫn import
import { useToast } from './Toast';
import '../styles/ProductList.css';
import { getProductMainImage } from '../utils/imageHelper';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  const { addToast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      const sortedProducts = response.data.sort((a, b) => b.id - a.id);
      setProducts(sortedProducts);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm: ' + err.message);
      addToast('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await productAPI.deleteProduct(id);
      addToast('Xóa sản phẩm thành công!', 'success');
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      addToast('Lỗi khi xóa sản phẩm!', 'error');
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleSaveSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    addToast(editingProduct ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
    fetchProducts();
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name?.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.categoryId?.toString() === filterCategory;
    return matchSearch && matchCategory;
  });

  const uniqueCategories = [...new Set(products.map(p => {
      return JSON.stringify({ id: p.categoryId, name: p.categoryName });
  }).filter(c => {
      try { return JSON.parse(c).id != null; } catch(e) { return false; }
  }))].map(c => JSON.parse(c));

  if (loading && products.length === 0) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="product-list-admin">
      {error && <div className="error-message">{error}</div>}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm sản phẩm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="admin-search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {uniqueCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={fetchProducts} className="btn-refresh-admin">🔄 Làm mới</button>
        </div>
        <button onClick={handleAdd} className="btn-add-admin">➕ Thêm sản phẩm</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Ảnh</th>
              <th>Danh mục</th>
              <th>Giá (VNĐ)</th>
              <th>Số lượng</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="8" className="no-data">Không có sản phẩm nào</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="td-id">#{product.id}</td>
                  <td className="td-name">{product.name}</td>
                  <td className="td-image">
                    <img 
                        src={getProductMainImage(product)}
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                    />
                  </td>
                  <td className="td-category">
                    {product.categoryName ? <span className="category-tag">{product.categoryName}</span> : <span className="no-category">Chưa có</span>}
                  </td>
                  <td className="td-price">{product.price?.toLocaleString('vi-VN')}</td>
                  <td className="td-quantity">
                    <span className={`quantity-badge ${product.quantity === 0 ? 'out' : product.quantity < 5 ? 'low' : 'in'}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="td-date">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="td-actions">
                    <button onClick={() => handleEdit(product)} className="btn-edit-table">✏️ Sửa</button>
                    <button onClick={() => openDeleteModal(product)} className="btn-delete-table">🗑️ Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM: Chỉ hiển thị component ProductForm */}
      {/* ProductForm giờ tự quản lý Overlay và Layout của nó */}
      {showForm && (
         <ProductForm
            product={editingProduct}
            onClose={handleCloseForm}
            onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* MODAL DELETE CONFIRMATION */}
      {showDeleteModal && productToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-wrapper">⚠️</div>
            <h3>Xác nhận xóa?</h3>
            <p>Bạn có chắc muốn xóa sản phẩm <strong>{productToDelete.name}</strong>?</p>
            <p style={{color: '#ef4444', fontSize: '13px'}}>Hành động này không thể hoàn tác.</p>
            <div className="delete-actions">
              <button onClick={closeDeleteModal} className="btn-cancel">Hủy</button>
              <button onClick={() => handleDelete(productToDelete.id)} className="btn-delete-confirm">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;