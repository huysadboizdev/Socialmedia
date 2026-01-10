import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/all-user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}" không? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/delete-user`, { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success(`Đã xóa người dùng ${username} thành công`);
        setUsers(users.filter(user => user._id !== userId));
      } else {
        toast.error(res.data.message || "Xóa người dùng thất bại");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Lỗi khi xóa người dùng");
    }
  };
  const handleAdjustBalance = async (userId, username) => {
    const amountStr = window.prompt(`Nhập số tiền muốn cộng cho "${username}" (Dùng số âm để trừ tiền):`, "0");
    if (amountStr === null) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      toast.error("Số tiền không hợp lệ");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/adjust-balance`, { userId, amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, balance: res.data.newBalance } : user
        ));
      } else {
        toast.error(res.data.message || "Điều chỉnh số dư thất bại");
      }
    } catch (error) {
      console.error("Error adjusting balance:", error);
      toast.error("Lỗi khi điều chỉnh số dư");
    }
  };

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    email: '',
    isBlocked: false,
    balance: 0
  });

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || '',
      fullName: user.fullName || '',
      email: user.email || '',
      isBlocked: user.isBlocked || false,
      balance: user.balance || 0
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/edit-user`, {
        userId: editingUser._id,
        ...editForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Cập nhật thông tin thành công");
        setUsers(users.map(user => 
          user._id === editingUser._id ? { ...user, ...editForm } : user
        ));
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        toast.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Lỗi khi cập nhật thông tin");
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight text-center md:text-left">Quản Lý Người Dùng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center md:text-left">Xem và quản lý tất cả thành viên trong hệ thống.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined text-5xl animate-spin opacity-20">sync</span>
            <p className="mt-4 font-medium opacity-50">Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Thành viên</th>
                  <th className="px-6 py-4">Số dư</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                      Không tìm thấy người dùng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                            {user.image ? (
                              <img src={user.image} alt={user.username} className="size-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400">person</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{user.username}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {user.balance?.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">₫</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.isBlocked 
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                            : 'bg-green-500/10 text-green-500 border border-green-500/20'
                        }`}>
                          {user.isBlocked ? 'Bị Khóa' : 'Hoạt Động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-green-500 transition-all"
                            title="Cộng tiền"
                            onClick={() => handleAdjustBalance(user._id, user.username)}
                          >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                          </button>
                           <button 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-all"
                            title="Chỉnh sửa"
                            onClick={() => handleEditClick(user)}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all title='Xóa người dùng'"
                            onClick={() => handleDeleteUser(user._id, user.username)}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
              Hiển thị <strong>{filteredUsers.length}</strong> trên tổng số <strong>{users.length}</strong> thành viên
            </p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Chỉnh sửa người dùng</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Số dư (VNĐ)
                </label>
                <input
                  type="number"
                  value={editForm.balance}
                  onChange={(e) => setEditForm({...editForm, balance: Number(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái khóa</span>
                <button
                  onClick={() => setEditForm({...editForm, isBlocked: !editForm.isBlocked})}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    editForm.isBlocked ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                      editForm.isBlocked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
