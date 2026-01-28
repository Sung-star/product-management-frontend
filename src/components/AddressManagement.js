import React, { useState, useEffect } from 'react';
import { addressAPI } from '../services/api';
import { useToast } from './Toast';
import {
  HiOutlineLocationMarker,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineStar,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding
} from 'react-icons/hi';

const AddressManagement = ({ userId: propUserId }) => { // Đổi tên prop để tránh trùng
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [effectiveUserId, setEffectiveUserId] = useState(null);

  const [formData, setFormData] = useState({
    recipientName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    label: 'HOME',
    isDefault: false
  });

  // ✅ TỰ ĐỘNG XÁC MINH USER ID
  useEffect(() => {
    if (propUserId && propUserId !== 'undefined') {
      setEffectiveUserId(propUserId);
    } else {
      // Nếu prop không có, thử tìm trong localStorage (giống file api.js của bạn)
      const userAuth = localStorage.getItem('user_auth');
      if (userAuth) {
        try {
          const user = JSON.parse(userAuth);
          const id = user.id || user.userId; // Thử cả 2 trường hợp id hoặc userId
          if (id) setEffectiveUserId(id);
        } catch (e) {
          console.error("Lỗi parse user_auth", e);
        }
      }
    }
  }, [propUserId]);

  // ✅ FETCH ĐỊA CHỈ KHI ĐÃ CÓ ID THẬT
  useEffect(() => {
    if (effectiveUserId) {
      fetchAddresses();
    }
  }, [effectiveUserId]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressAPI.getUserAddresses(effectiveUserId);
      setAddresses(response.data);
    } catch (err) {
      console.error('Fetch addresses error:', err);
      addToast('Không thể tải danh sách địa chỉ!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.recipientName.trim()) newErrors.recipientName = 'Vui lòng nhập tên người nhận';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.province.trim()) newErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!formData.district.trim()) newErrors.district = 'Vui lòng chọn Quận/Huyện';
    if (!formData.ward.trim()) newErrors.ward = 'Vui lòng chọn Phường/Xã';
    if (!formData.detailAddress.trim()) newErrors.detailAddress = 'Vui lòng nhập địa chỉ cụ thể';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!effectiveUserId) {
      addToast('Lỗi: Không tìm thấy ID người dùng!', 'error');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await addressAPI.updateAddress(editingId, formData);
        addToast('Cập nhật địa chỉ thành công!', 'success');
      } else {
        await addressAPI.createAddress(effectiveUserId, formData);
        addToast('Thêm địa chỉ mới thành công!', 'success');
      }
      fetchAddresses();
      handleCancel();
    } catch (err) {
      addToast('Thao tác thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detailAddress: address.detailAddress,
      label: address.label || 'HOME',
      isDefault: address.isDefault
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    try {
      setLoading(true);
      await addressAPI.deleteAddress(id);
      addToast('Xóa địa chỉ thành công!', 'success');
      fetchAddresses();
    } catch (err) {
      addToast('Không thể xóa địa chỉ!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      await addressAPI.setDefaultAddress(id);
      addToast('Đã đặt làm địa chỉ mặc định!', 'success');
      fetchAddresses();
    } catch (err) {
      addToast('Thao tác thất bại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      recipientName: '', phone: '', province: '', district: '', 
      ward: '', detailAddress: '', label: 'HOME', isDefault: false
    });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'HOME': return <HiOutlineHome />;
      case 'OFFICE': return <HiOutlineBriefcase />;
      case 'COMPANY': return <HiOutlineOfficeBuilding />;
      default: return <HiOutlineLocationMarker />;
    }
  };

  const getLabelText = (label) => {
    switch (label) {
      case 'HOME': return 'Nhà';
      case 'OFFICE': return 'Văn phòng';
      case 'COMPANY': return 'Công ty';
      default: return label;
    }
  };

  // ✅ NẾU KHÔNG CÓ ID VÀ CŨNG KHÔNG CÓ TRONG STORAGE THÌ MỚI BÁO LỖI
  if (!effectiveUserId) {
    return (
      <div className="profile-card">
        <div className="loading-state" style={{padding: '40px', textAlign: 'center'}}>
          <p>Đang tải thông tin người dùng...</p>
          <p style={{fontSize: '0.8rem', color: '#888'}}>Vui lòng đăng nhập lại nếu chờ quá lâu.</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="profile-card">
        <div className="card-header">
          <h2>
            <HiOutlineLocationMarker /> 
            {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label><HiOutlineUser className="label-icon" /> Tên người nhận *</label>
                <input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} className={errors.recipientName ? 'input-error' : ''} />
                {errors.recipientName && <span className="error-message">{errors.recipientName}</span>}
              </div>
              <div className="form-group">
                <label><HiOutlinePhone className="label-icon" /> Số điện thoại *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'input-error' : ''} />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tỉnh/Thành phố *</label>
                <input type="text" name="province" value={formData.province} onChange={handleChange} className={errors.province ? 'input-error' : ''} />
              </div>
              <div className="form-group">
                <label>Quận/Huyện *</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} className={errors.district ? 'input-error' : ''} />
              </div>
            </div>
            <div className="form-group">
              <label>Phường/Xã *</label>
              <input type="text" name="ward" value={formData.ward} onChange={handleChange} className={errors.ward ? 'input-error' : ''} />
            </div>
            <div className="form-group">
              <label>Địa chỉ cụ thể *</label>
              <textarea name="detailAddress" value={formData.detailAddress} onChange={handleChange} className={errors.detailAddress ? 'input-error' : ''} rows="3" />
            </div>
            <div className="form-group">
              <label>Loại địa chỉ</label>
              <select name="label" value={formData.label} onChange={handleChange}>
                <option value="HOME">Nhà</option>
                <option value="OFFICE">Văn phòng</option>
                <option value="COMPANY">Công ty</option>
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                <span>Đặt làm địa chỉ mặc định</span>
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}><HiOutlineX /> Hủy</button>
            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Đang lưu...' : <><HiOutlineCheck /> Lưu địa chỉ</>}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="address-management">
      <div className="profile-card">
        <div className="card-header">
          <h2><HiOutlineLocationMarker /> Địa chỉ giao hàng</h2>
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <HiOutlinePlus /> Thêm địa chỉ mới
          </button>
        </div>

        {loading && addresses.length === 0 ? (
          <div className="loading-state">Đang tải...</div>
        ) : addresses.length === 0 ? (
          <div className="empty-state">
            <HiOutlineLocationMarker />
            <p>Chưa có địa chỉ giao hàng nào</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>Thêm địa chỉ đầu tiên</button>
          </div>
        ) : (
          <div className="address-list">
            {addresses.map((address) => (
              <div key={address.id} className="address-item">
                <div className="address-header">
                  <div className="address-label">
                    {getLabelIcon(address.label)}
                    <span>{getLabelText(address.label)}</span>
                  </div>
                  {address.isDefault && <span className="default-badge"><HiOutlineStar /> Mặc định</span>}
                </div>
                <div className="address-content">
                  <div className="address-info">
                    <p className="recipient-name">{address.recipientName}</p>
                    <p className="phone">{address.phone}</p>
                    <p className="full-address">
                      {address.detailAddress}, {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                  <div className="address-actions">
                    {!address.isDefault && (
                      <button className="btn-action btn-default" onClick={() => handleSetDefault(address.id)} disabled={loading}>
                        <HiOutlineStar /> Đặt mặc định
                      </button>
                    )}
                    <button className="btn-action btn-edit" onClick={() => handleEdit(address)}>Sửa</button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(address.id)} disabled={loading}>Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManagement;