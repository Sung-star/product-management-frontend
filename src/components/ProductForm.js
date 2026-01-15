import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import '../styles/ProductForm.css';

const ProductForm = ({ product, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || '',
        categoryId: product.categoryId || '',
      });
      
      // Load existing images
      if (product.imageUrls) {
        const images = Array.isArray(product.imageUrls) 
          ? product.imageUrls 
          : product.imageUrls.split(',').map(url => url.trim());
        setExistingImages(images);
      }
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories", err.response?.data || err.message);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length + existingImages.length > 5) {
      setError('Chỉ được upload tối đa 5 ảnh!');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Tên sản phẩm không được để trống');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Giá phải lớn hơn 0');
      return false;
    }
    if (!formData.quantity || formData.quantity < 0) {
      setError('Số lượng không được âm');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add product data as JSON blob
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };

      // If editing, include existing images
      if (product && existingImages.length > 0) {
        productData.existingImageUrls = existingImages;
      }

      formDataToSend.append(
        'product',
        new Blob([JSON.stringify(productData)], { type: 'application/json' })
      );

      // Add image files
      imageFiles.forEach((file, index) => {
        formDataToSend.append('images', file);
      });

      if (product) {
        await productAPI.updateProductWithImages(product.id, formDataToSend);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productAPI.createProductWithImages(formDataToSend);
        alert('Thêm sản phẩm thành công!');
      }

      onSaveSuccess();
    } catch (err) {
      setError('Lỗi: ' + (err.response?.data?.message || err.message));
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content product-form-modal">
        <div className="modal-header">
          <h2>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên sản phẩm <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá (VNĐ) <span className="required">*</span></label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Số lượng <span className="required">*</span></label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hình ảnh sản phẩm (Tối đa 5 ảnh)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="file-input"
            />
            <p className="file-hint">
              📷 Có thể chọn nhiều ảnh cùng lúc. Tổng số ảnh: {existingImages.length + imageFiles.length}/5
            </p>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="image-preview-section">
              <label>Ảnh hiện tại:</label>
              <div className="image-preview-grid">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="image-preview-item">
                    <img 
                      src={`http://localhost:8080${url}`} 
                      alt={`Existing ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeExistingImage(index)}
                      title="Xóa ảnh"
                    >
                      ×
                    </button>
                    {index === 0 && <span className="main-badge">Chính</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="image-preview-section">
              <label>Ảnh mới sẽ thêm:</label>
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="image-preview-item">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeNewImage(index)}
                      title="Xóa ảnh"
                    >
                      ×
                    </button>
                    {existingImages.length === 0 && index === 0 && (
                      <span className="main-badge">Chính</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;