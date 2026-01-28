import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import '../styles/ProductList.css'; // Dùng chung CSS để đồng bộ

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
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length + existingImages.length > 5) {
      setError('Chỉ được upload tối đa 5 ảnh!');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      };

      if (product && existingImages.length > 0) {
        productData.existingImageUrls = existingImages;
      }

      formDataToSend.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
      imageFiles.forEach(file => formDataToSend.append('images', file));

      if (product) {
        await productAPI.updateProductWithImages(product.id, formDataToSend);
      } else {
        await productAPI.createProductWithImages(formDataToSend);
      }
      onSaveSuccess();
    } catch (err) {
      setError('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-form-card" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-form-header">
          <h2>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button className="close-btn-form" onClick={onClose}>×</button>
        </div>

        {/* BODY SCROLLABLE */}
        <div className="modal-form-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Tên sản phẩm <span className="required">*</span></label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="3" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá (VNĐ) <span className="required">*</span></label>
              <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} min="0" required />
            </div>
            <div className="form-group">
              <label>Số lượng <span className="required">*</span></label>
              <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange} min="0" required />
            </div>
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <select name="categoryId" className="form-control" value={formData.categoryId} onChange={handleChange}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Hình ảnh (Max 5)</label>
            <div className="file-input-wrapper">
               <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{display:'none'}} id="file-upload" />
               <label htmlFor="file-upload" style={{cursor:'pointer', width:'100%', height:'100%', display:'block'}}>
                  📂 Click để chọn ảnh hoặc kéo thả vào đây
               </label>
            </div>
            <div className="image-preview-grid">
               {existingImages.map((url, i) => (
                 <div key={`exist-${i}`} className="preview-item">
                    <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`} className="preview-img" alt="Existing" />
                    <button type="button" className="btn-remove-img" onClick={() => removeExistingImage(i)}>×</button>
                    {i === 0 && <span className="badge-main">Chính</span>}
                 </div>
               ))}
               {imagePreviews.map((src, i) => (
                 <div key={`new-${i}`} className="preview-item">
                    <img src={src} className="preview-img" alt="New" />
                    <button type="button" className="btn-remove-img" onClick={() => removeNewImage(i)}>×</button>
                    {existingImages.length === 0 && i === 0 && <span className="badge-main">Chính</span>}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* FOOTER FIXED */}
        <div className="modal-form-footer">
           <button type="button" className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
           <button type="button" className="btn-submit" onClick={handleSubmit} disabled={loading}>
             {loading ? 'Đang lưu...' : 'Lưu lại'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;