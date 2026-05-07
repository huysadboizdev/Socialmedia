import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import ConfirmModal from '@/components/common/ConfirmModal';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFixConfirm, setShowFixConfirm] = useState(false);
  const [announcement, setAnnouncement] = useState({
    title: 'THÔNG BÁO',
    items: [
      { icon: '🔔', text: 'Chào Mừng Bạn Đến Với huytichxanh.online Social Media 💖' },
      { icon: '👥', text: 'Tham Gia Nhóm Zalo Nhận Thông Báo Mới Nhất' },
      { icon: '🔥', text: 'Khuyến Mại Nạp 11 % Từ 1 ➖ 3 Hàng Tháng' },
      { icon: '📲', text: 'Zalo Hỗ Trợ : 0383345622' },
      { icon: '🌐', text: 'Nhóm Zalo : Tại Đây' },
      { icon: '🕒', text: 'Time Support : 6:00 - 23:00' },
    ]
  });

  const [membershipConfig, setMembershipConfig] = useState({
    tiers: [
      { name: 'Thành viên', threshold: 0, discount: 0 },
      { name: 'Cộng tác viên', threshold: 5000000, discount: 0.1 },
      { name: 'Nhà phân phối', threshold: 20000000, discount: 0.3 }
    ]
  });
  const [savingMembership, setSavingMembership] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const [annRes, memRes] = await Promise.all([
          axios.get(`${API_URL}/api/user/announcement`),
          axios.get(`${API_URL}/api/admin/membership-config`, {
             headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (annRes.data.success && annRes.data.announcement) {
          setAnnouncement(annRes.data.announcement);
        }
        if (memRes.data.success && memRes.data.config) {
          setMembershipConfig(memRes.data.config);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleUpdateTier = (index, field, value) => {
    const newTiers = [...membershipConfig.tiers];
    newTiers[index][field] = value;
    setMembershipConfig({ ...membershipConfig, tiers: newTiers });
  };

  const handleAddTier = () => {
    setMembershipConfig({
      ...membershipConfig,
      tiers: [...membershipConfig.tiers, { name: 'Cấp bậc mới', threshold: 0, discount: 0 }]
    });
  };

  const handleRemoveTier = (index) => {
    const newTiers = membershipConfig.tiers.filter((_, i) => i !== index);
    setMembershipConfig({ ...membershipConfig, tiers: newTiers });
  };

  const handleSaveMembership = async () => {
    setSavingMembership(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/membership-config`, 
        { value: membershipConfig },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Cập nhật cấp bậc thành công!");
      } else {
        toast.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
      console.error(error);
    } finally {
      setSavingMembership(false);
    }
  };

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

  const executeFixBalances = async () => {
    setShowFixConfirm(false);
    
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
      
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined text-2xl">military_tech</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cấu hình Cấp bậc & Chiết khấu</h3>
          </div>
          <button
            onClick={handleSaveMembership}
            disabled={savingMembership}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-xl transition-all flex items-center gap-2"
          >
            {savingMembership ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
            Lưu Cấu Hình
          </button>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <div className="col-span-4">Tên Cấp Bậc</div>
                <div className="col-span-4">Mốc Nạp (VNĐ)</div>
                <div className="col-span-3">Giảm Giá (%)</div>
                <div className="col-span-1 text-center">Xóa</div>
            </div>

            <div className="space-y-3">
                {membershipConfig.tiers.map((tier, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center group">
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={tier.name}
                                onChange={(e) => handleUpdateTier(idx, 'name', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="VD: Cộng tác viên"
                            />
                        </div>
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={tier.threshold.toLocaleString('vi-VN')}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    handleUpdateTier(idx, 'threshold', parseInt(val) || 0);
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-3">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={tier.discount * 100}
                                    onChange={(e) => handleUpdateTier(idx, 'discount', (parseFloat(e.target.value) || 0) / 100)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-8 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                            </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <button 
                                onClick={() => handleRemoveTier(idx)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleAddTier}
                className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all font-medium flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">add_circle</span>
                Thêm Cấp Bậc Mới
            </button>
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
            onClick={() => setShowFixConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">build</span>
            Sửa Lỗi Số Dư Khổng Lồ
          </button>
      </div>

      <ConfirmModal 
        isOpen={showFixConfirm}
        title="Xác nhận sửa lỗi số dư"
        message="CẢNH BÁO: Thao tác này sẽ quét toàn bộ thành viên và sửa các số dư bị lỗi 'khổng lồ' (hàng nghìn tỷ). Bạn có chắc chắn muốn thực hiện?"
        onConfirm={executeFixBalances}
        onCancel={() => setShowFixConfirm(false)}
      />
    </div>
  );
};

export default AdminSettings;
