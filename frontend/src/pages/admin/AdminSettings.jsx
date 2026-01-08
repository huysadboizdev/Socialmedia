import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: 'THÔNG BÁO',
    items: [
      { icon: '🔔', text: 'Chào Mừng Bạn Đến Với Sub6Sao.Com Social Media 💖' },
      { icon: '👥', text: 'Tham Gia Nhóm Zalo Nhận Thông Báo Mới Nhất' },
      { icon: '🔥', text: 'Khuyến Mại Nạp 11 % Từ 1 ➖ 3 Hàng Tháng' },
      { icon: '📲', text: 'Zalo Hỗ Trợ : 0383345622' },
      { icon: '🌐', text: 'Nhóm Zalo : Tại Đây' },
      { icon: '🕒', text: 'Time Support : 6:00 - 23:00' },
    ]
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/announcement`);
        if (res.data.success && res.data.announcement) {
          setAnnouncement(res.data.announcement);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...announcement.items];
    newItems[index][field] = value;
    setAnnouncement({ ...announcement, items: newItems });
  };

  const handleAddItem = () => {
    setAnnouncement({
      ...announcement,
      items: [...announcement.items, { icon: '✨', text: 'Nội dung mới' }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = announcement.items.filter((_, i) => i !== index);
    setAnnouncement({ ...announcement, items: newItems });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/announcement`, 
        { value: announcement },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Cập nhật thông báo thành công!");
      } else {
        toast.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleFixBalances = async () => {
    if (!window.confirm("CẢNH BÁO: Thao tác này sẽ quét toàn bộ thành viên và sửa các số dư bị lỗi 'khổng lồ' (hàng nghìn tỷ). Bạn có chắc chắn muốn thực hiện?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/fix-balances`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Đã sửa xong ${res.data.fixed} tài khoản bị lỗi!`);
      }
    } catch (error) {
      toast.error("Lỗi khi thực hiện fix dữ liệu");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl animate-spin text-purple-600">sync</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Cài Đặt Hệ Thống</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Quản lý các thông tin hiển thị trên toàn hệ thống.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <span className="material-symbols-outlined text-2xl">campaign</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thông Báo Startup</h3>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            {saving ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
            Lưu Thay Đổi
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Tiêu Đề</label>
            <input
              type="text"
              value={announcement.title}
              onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all outline-none"
              placeholder="Nhập tiêu đề thông báo..."
            />
          </div>

          <div>
             <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Các Mục Thông Báo</label>
                <button 
                  onClick={handleAddItem}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Thêm dòng mới
                </button>
             </div>
             
             <div className="space-y-3">
                {announcement.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 group">
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => handleUpdateItem(idx, 'icon', e.target.value)}
                      className="w-12 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-3 text-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Icon"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateItem(idx, 'text', e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      placeholder="Nhập nội dung..."
                    />
                    <button 
                      onClick={() => handleRemoveItem(idx)}
                      className="size-12 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 cursor-not-allowed">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Cài đạt SEO (Coming Soon)</h3>
              <p className="text-sm text-slate-500">Sẽ sớm có tính năng chỉnh sửa meta tags, keywords.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Cài đặt Thanh Toán (Coming Soon)</h3>
              <p className="text-sm text-slate-500">Sẽ sớm có tính năng chỉnh sửa thông tin chuyển khoản.</p>
          </div>
      </div>

      <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Công Cụ Khẩn Cấp</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Sử dụng công cụ này để sửa các số dư bị lỗi hiển thị con số quá lớn (hàng nghìn tỷ) do lỗi ghép chuỗi dữ liệu cũ.
          </p>
          <button 
            onClick={handleFixBalances}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">build</span>
            Sửa Lỗi Số Dư Khổng Lồ
          </button>
      </div>
    </div>
  );
};

export default AdminSettings;
