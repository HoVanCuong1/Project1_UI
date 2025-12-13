import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../config/api"; // Chỉnh lại đường dẫn cho đúng
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho Modal (Thêm/Sửa)
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    active: "OPEN", // Mặc định OPEN
    roles: [], // Mảng string ["USER", "MANAGER"...]
  });

  // Danh sách Role hệ thống hỗ trợ
  const ALL_ROLES = ["USER", "MANAGER", "ADMIN"];

  // --- HÀM GỌI API ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      // API trả về mảng user
      setUsers(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- XỬ LÝ FORM ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleName) => {
    setFormData((prev) => {
      const currentRoles = prev.roles;
      if (currentRoles.includes(roleName)) {
        // Nếu đã có -> Bỏ chọn
        return { ...prev, roles: currentRoles.filter((r) => r !== roleName) };
      } else {
        // Nếu chưa có -> Chọn thêm
        return { ...prev, roles: [...currentRoles, roleName] };
      }
    });
  };

  // --- MỞ MODAL ---
  const openAddModal = () => {
    setIsEdit(false);
    setCurrentUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      active: "OPEN",
      roles: ["USER"], // Mặc định có quyền USER
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEdit(true);
    setCurrentUser(user);
    // Map dữ liệu user vào form
    // Lưu ý: role từ API là mảng object [{name:"USER"}], cần map về mảng string ["USER"]
    const roleNames = user.roles ? user.roles.map((r) => r.name) : [];
    
    setFormData({
      name: user.name,
      email: user.email, // Email thường ko cho sửa, hiển thị readonly
      password: "", // Để trống, nếu nhập mới update
      active: user.active,
      roles: roleNames,
    });
    setShowModal(true);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // UPDATE
        // Chỉ gửi password nếu người dùng có nhập
        const payload = {
          name: formData.name,
          active: formData.active,
          roles: formData.roles,
        };
        if (formData.password) {
          payload.password = formData.password;
        }

        await updateUser(currentUser.id, payload);
        alert("Cập nhật thành công!");
      } else {
        // CREATE
        await createUser(formData);
        alert("Tạo user mới thành công!");
      }
      setShowModal(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Lỗi submit:", error);
      alert("Có lỗi xảy ra: " + (error.response?.data?.message || error.message));
    }
  };

  // --- DELETE ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa User này?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="user-manager-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản Lý Người Dùng</h4>
          <p className="text-muted mb-0 small">Cấp quyền, khóa tài khoản và quản lý thông tin</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="bi bi-person-plus-fill me-2"></i> Thêm User
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Email / Tên</th>
                  <th>Vai Trò (Roles)</th>
                  <th>Trạng Thái</th>
                  <th className="text-end pe-4">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-4">Đang tải...</td></tr>
                ) : users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{u.name}</div>
                        <div className="text-muted small">{u.email}</div>
                      </td>
                      <td>
                        {u.roles && u.roles.map((r, idx) => (
                          <span key={idx} className={`badge me-1 role-badge ${r.name}`}>
                            {r.name}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={`badge ${u.active === "OPEN" ? "bg-success" : "bg-danger"}`}>
                          {u.active}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => openEditModal(u)}
                        >
                        
                          <i className="bi bi-person-plus-fill me-2"></i> Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(u.id)}
                        >
                          <i className="bi bi-person-plus-fill me-2"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-4">Không có user nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL (Tự dựng bằng CSS cho đơn giản, hoặc dùng Bootstrap Modal class) --- */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-content-custom">
            <div className="modal-header-custom">
              <h5 className="mb-0">{isEdit ? "Cập Nhật User" : "Thêm User Mới"}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                X
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom">
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isEdit} // Không cho sửa email khi Edit
                    required
                  />
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Họ và Tên</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label small fw-bold">
                    {isEdit ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEdit} // Bắt buộc khi tạo mới
                  />
                </div>

                {/* Active Status */}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Trạng thái</label>
                  <select
                    name="active"
                    className="form-select"
                    value={formData.active}
                    onChange={handleInputChange}
                  >
                    <option value="OPEN">OPEN (Hoạt động)</option>
                    <option value="CLOSE">CLOSE (Khóa)</option>
                  </select>
                </div>

                {/* Roles Checkbox */}
                <div className="mb-3">
                  <label className="form-label small fw-bold d-block">Phân Quyền</label>
                  <div className="d-flex gap-3 flex-wrap">
                    {ALL_ROLES.map((role) => (
                      <div key={role} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`role-${role}`}
                          checked={formData.roles.includes(role)}
                          onChange={() => handleRoleChange(role)}
                        />
                        <label className="form-check-label" htmlFor={`role-${role}`}>
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;