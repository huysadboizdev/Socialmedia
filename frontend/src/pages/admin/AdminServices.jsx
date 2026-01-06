import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Facebook',
    category: '',
    price: '',
    speed: '',
    description: '',
    isActive: true
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/list`);
      if (res.data.success) {
        setServices(res.data.services || []);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        platform: service.platform,
        category: service.category,
        price: service.price,
        speed: service.speed,
        description: service.description || '',
        isActive: service.isActive !== false
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        platform: 'Facebook',
        category: '',
        price: '',
        speed: '',
        description: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editingService) {
        res = await axios.post(`${API_URL}/api/admin/edit-service`, {
          ...formData,
          serviceId: editingService._id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/api/admin/add-service`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        toast.success(editingService ? "Cập nhật dịch vụ thành công" : "Thêm dịch vụ mới thành công");
        fetchServices();
        handleCloseModal();
      } else {
        toast.error(res.data.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Lỗi khi lưu dịch vụ");
    }
  };

  const handleDelete = async (serviceId, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${name}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/delete-service`, { serviceId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Đã xóa dịch vụ");
        setServices(services.filter(s => s._id !== serviceId));
      }
    } catch {
      toast.error("Lỗi khi xóa dịch vụ");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Quản Lý Dịch Vụ</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Cấu hình các gói dịch vụ và giá cả trên hệ thống.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm dịch vụ mới
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined text-5xl animate-spin opacity-20">sync</span>
            <p className="mt-4 font-medium opacity-50">Đang tải danh sách dịch vụ...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Dịch vụ</th>
                  <th className="px-6 py-4">Nền tảng</th>
                  <th className="px-6 py-4">Giá (đ)</th>
                  <th className="px-6 py-4">Tốc độ</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                      Chưa có dịch vụ nào được tạo.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{service.name}</span>
                          <span className="text-xs text-slate-500">{service.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                           service.platform === 'Facebook' ? 'bg-blue-500/10 text-blue-500' :
                           service.platform === 'TikTok' ? 'bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white' :
                           'bg-pink-500/10 text-pink-500'
                         }`}>
                           {service.platform}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-600 dark:text-purple-400">{service.price.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{service.speed}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            service.isActive !== false 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                         }`}>
                           {service.isActive !== false ? 'Hoạt động' : 'Tắt'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(service)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-all"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(service._id, service.name)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nền tảng</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                  <select 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Tăng Like">Tăng Like</option>
                    <option value="Tăng Theo Dõi">Tăng Theo Dõi</option>
                    <option value="Tăng Share">Tăng Share</option>
                    <option value="Tích Xanh">Tích Xanh</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên dịch vụ / Máy chủ</label>
                <input 
                  type="text"
                  required
                  placeholder="VD: Server 1 (Like Việt)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá mỗi tương tác (đ)</label>
                  <input 
                    type="number"
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tốc độ chạy</label>
                  <input 
                    type="text"
                    required
                    placeholder="VD: Siêu nhanh, 24h..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={formData.speed}
                    onChange={(e) => setFormData({...formData, speed: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả (nếu có)</label>
                <textarea 
                  rows="2"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="size-4 rounded accent-purple-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Hoạt động dịch vụ</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
                >
                  {editingService ? "Cập nhật" : "Lưu dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
