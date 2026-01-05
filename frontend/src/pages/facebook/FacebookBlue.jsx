import React, { useState } from 'react';
import { toast } from 'sonner';

const FacebookBlue = () => {
  const [formData, setFormData] = useState({
    targetUrl: '',
    username: '',
    password: '',
    twoFaCode: '',
    contactInfo: '',
    note: ''
  });

  const price = 499000;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.targetUrl || !formData.username || !formData.password || !formData.contactInfo) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    toast.success('Đang khởi tạo đơn hàng...');
    console.log('Order Data:', {
      service: 'Facebook Blue Tick',
      price,
      ...formData
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-blue-500">verified</span>
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Dịch vụ Ngâm Tích Xanh</span>
            </div>

            {/* Service Option */}
            <div className="mb-8">
              <div className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-900/10 rounded-lg flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-200">Dịch vụ Ngâm Tích Xanh</span>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {price.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* URL Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                URL Facebook cá nhân/Fanpage cần ngâm:
              </label>
              <input
                type="text"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Ví dụ: https://www.facebook.com/profile.php?id=..."
              />
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tài khoản Facebook:
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Email hoặc số điện thoại đăng nhập"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mật khẩu Facebook:
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Mật khẩu Facebook"
                />
              </div>
            </div>

            {/* 2FA */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mã 2FA Facebook (nếu có):
              </label>
              <input
                type="text"
                name="twoFaCode"
                value={formData.twoFaCode}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Mã 2FA (nếu có, để trống nếu không)"
              />
            </div>

            {/* Note */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Thông tin yêu cầu thêm về dịch vụ (tùy chọn):
              </label>
              <textarea
                rows="3"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Ví dụ: Cần ngâm để lên tích xanh nhanh nhất có thể..."
              ></textarea>
            </div>

            {/* Contact Info (UPDATED AS REQUESTED) */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Link facebook hoặc sdt zalo để liên hệ:
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Nhập link Facebook hoặc SĐT Zalo của bạn..."
              />
            </div>

            <button 
              onClick={handleSubmit} 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
            >
              Đặt dịch vụ ngay
            </button>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="xl:col-span-1 space-y-6">
          {/* Instructions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-5 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">info</span>
              Hướng dẫn đặt hàng
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Nhập đúng thông tin yêu cầu</div>
                  <p className="text-xs text-slate-500 leading-relaxed">Nhập đúng thông tin nick fb bạn để hệ thống tự setup ngâm cho bạn</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Đặt 2FA an toàn</div>
                  <p className="text-xs text-slate-500 leading-relaxed">2FA kèm theo để hệ thống cho thể truy cập vào dễ dàng hơn để ngâm cho bạn</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Không thay đổi thông tin</div>
                  <p className="text-xs text-slate-500 leading-relaxed">Không thay đổi thông tin hay mật khẩu trong quá trình gửi ngâm</p>
                </div>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                <span className="font-bold">Lưu ý:</span> Thời gian gửi ngâm có tùy acc có thể nhanh và có thể chậm nên mọi cứ thong thả!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookBlue;
