import React, { useState, useEffect } from 'react';
import { categoryAPI } from '../services/api';
import { useToast } from './Toast';
import '../styles/CategoryManager.css';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh mục: ' + err.message);
      addToast('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Vui lòng nhập tên danh mục!', 'warning');
      return;
    }

    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, formData);
        addToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await categoryAPI.createCategory(formData);
        addToast('Thêm danh mục thành công!', 'success');
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      fetchCategories();
    } catch (err) {
      addToast('Lỗi: ' + err.message, 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryAPI.deleteCategory(id);
      addToast('Xóa danh mục thành công!', 'success');
      fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      addToast('Lỗi khi xóa: ' + err.message, 'error');
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setShowForm(true);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="category-manager-admin">
      {error && <div className="error-message">{error}</div>}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <h2 className="section-title">Tổng số: {categories.length} danh mục</h2>
        </div>
        <button onClick={handleAdd} className="btn-add-admin">
          ➕ Thêm danh mục
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="td-id">#{category.id}</td>
                  <td className="td-name">{category.name}</td>
                  <td className="td-actions">
                    <button onClick={() => handleEdit(category)} className="btn-edit-table">
                      ✏️ Sửa
                    </button>
                    <button onClick={() => openDeleteModal(category)} className="btn-delete-table">
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingCategory ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-modal-body">
                <div className="form-group-admin">
                  <label>Tên danh mục <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="form-modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel-form">
                  Hủy
                </button>
                <button type="submit" className="btn-submit-form">
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && categoryToDelete && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>⚠️ Xác nhận xóa</h3>
              <button className="modal-close-btn" onClick={closeDeleteModal}>×</button>
            </div>
            <div className="delete-modal-body">
              <p>Bạn có chắc chắn muốn xóa danh mục này không?</p>
              <div className="product-to-delete">
                <strong>{categoryToDelete.name}</strong>
                <span>ID: #{categoryToDelete.id}</span>
              </div>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="delete-modal-actions">
              <button onClick={closeDeleteModal} className="btn-cancel-delete">
                Hủy
              </button>
              <button onClick={() => handleDelete(categoryToDelete.id)} className="btn-confirm-delete">
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;