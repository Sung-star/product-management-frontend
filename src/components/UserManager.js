import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useToast } from './Toast';
import '../styles/UserManager.css';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'CLIENT'
  });

  const ROLES = {
    ADMIN: 'Quản trị viên',
    CLIENT: 'Khách hàng'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách người dùng: ' + err.message);
      addToast('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.email.trim()) {
      addToast('Vui lòng điền đầy đủ thông tin!', 'warning');
      return;
    }

    if (!editingUser && !formData.password) {
      addToast('Vui lòng nhập mật khẩu!', 'warning');
      return;
    }

    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, formData);
        addToast('Cập nhật người dùng thành công!', 'success');
      } else {
        await userAPI.createUser(formData);
        addToast('Thêm người dùng thành công!', 'success');
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        role: 'CLIENT'
      });
      fetchUsers();
    } catch (err) {
      addToast('Lỗi: ' + (err.response?.data || err.message), 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      fullName: user.fullName || '',
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await userAPI.deleteUser(id);
      addToast('Xóa người dùng thành công!', 'success');
      fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      addToast('Lỗi khi xóa: ' + (err.response?.data || err.message), 'error');
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      role: 'CLIENT'
    });
    setShowForm(true);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.username?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchKeyword.toLowerCase());
    
    const matchRole = filterRole === 'all' || user.role === filterRole;
    
    return matchSearch && matchRole;
  });

  if (loading && users.length === 0) {
    return <div className="admin-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="user-manager-admin">
      {error && <div className="error-message">{error}</div>}

      <div className="admin-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm người dùng..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="admin-search-input"
          />
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="CLIENT">Khách hàng</option>
          </select>

          <button onClick={fetchUsers} className="btn-refresh-admin">
            🔄 Làm mới
          </button>
        </div>

        <button onClick={handleAdd} className="btn-add-admin">
          ➕ Thêm người dùng
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="td-id">#{user.id}</td>
                  <td className="td-username">{user.username}</td>
                  <td className="td-name">{user.fullName || '-'}</td>
                  <td className="td-email">{user.email}</td>
                  <td className="td-role">
                    <span className={`role-badge role-${user.role?.toLowerCase()}`}>
                      {ROLES[user.role]}
                    </span>
                  </td>
                  <td className="td-date">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="td-actions">
                    <button onClick={() => handleEdit(user)} className="btn-edit-table">
                      ✏️ Sửa
                    </button>
                    <button onClick={() => openDeleteModal(user)} className="btn-delete-table">
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="form-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editingUser ? '✏️ Sửa người dùng' : '➕ Thêm người dùng mới'}</h3>
              <button className="modal-close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-modal-body">
                <div className="form-group-admin">
                  <label>Tên đăng nhập <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={editingUser}
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="form-group-admin">
                    <label>Mật khẩu <span className="required">*</span></label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                    />
                  </div>
                )}

                <div className="form-group-admin">
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group-admin">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ tên"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Vai trò <span className="required">*</span></label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="CLIENT">Khách hàng</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="form-modal-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel-form">
                  Hủy
                </button>
                <button type="submit" className="btn-submit-form">
                  {editingUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="delete-modal-overlay" onClick={closeDeleteModal}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>⚠️ Xác nhận xóa</h3>
              <button className="modal-close-btn" onClick={closeDeleteModal}>×</button>
            </div>
            <div className="delete-modal-body">
              <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
              <div className="product-to-delete">
                <strong>{userToDelete.username}</strong>
                <span>Email: {userToDelete.email}</span>
              </div>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="delete-modal-actions">
              <button onClick={closeDeleteModal} className="btn-cancel-delete">
                Hủy
              </button>
              <button onClick={() => handleDelete(userToDelete.id)} className="btn-confirm-delete">
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;