import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { validateLink, validateGmail } from '@/lib/validation';
import useCoupon from '@/hooks/useCoupon';
import OrderSuccessModal from '@/components/common/OrderSuccessModal';

const InstagramBlue = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    targetUrl: '',
    username: '',
    password: '',
    twoFaCode: '',
    contactInfo: '',
    note: '',
    discount: ''
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const { discountedPrice, originalPrice, hasDiscount, isCouponApplied, isValidating, error: couponError } = useCoupon(
    formData.discount,
    1, // Fixed quantity for Blue services
    selectedService?.originalPrice || selectedService?.price,
    API_URL
  );

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/api/user/service`, { action: 'getServices' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const igBlueServices = res.data.services.filter(s => s.platform === 'Instagram' && s.category === 'Tích Xanh' && s.isActive !== false);
          setServices(igBlueServices);
          if (igBlueServices.length > 0) {
            setSelectedService(igBlueServices[0]);
          }
        }
      } catch (err) {
        console.error("Fetch services error:", err);
        toast.error("Không thể tải thông tin dịch vụ");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.targetUrl || !formData.username || !formData.password || !formData.contactInfo) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!validateLink(formData.targetUrl, 'instagram')) {
      toast.error('Link Instagram không hợp lệ!');
      return;
    }

    if (!validateGmail(formData.username)) {
      toast.error('Tài khoản phải là địa chỉ Gmail (@gmail.com)!');
      return;
    }

    if (!selectedService) {
      toast.error('Dịch vụ hiện không khả dụng');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      toast.loading('Đang khởi tạo đơn hàng...', { id: 'order-toast' });
      
      const res = await axios.post(`${API_URL}/api/user/service`, {
        action: 'createOrder',
        serviceId: selectedService._id,
        quantity: 1,
        link: formData.targetUrl,
        couponCode: formData.discount,
        note: formData.note,
        details: {
          username: formData.username,
          password: formData.password,
          twoFaCode: formData.twoFaCode,
          contactInfo: formData.contactInfo
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (selectedService?.isMaintenance) {
        toast.error('Máy chủ này đang bảo trì, vui lòng chọn máy chủ khác', { id: 'order-toast' });
        return;
      }

      if (res.data.success) {
        toast.dismiss('order-toast');
        setShowSuccessModal(true);
        setFormData({
          targetUrl: '',
          username: '',
          password: '',
          twoFaCode: '',
          contactInfo: '',
          note: '',
          discount: ''
        });
      } else {
        toast.error(res.data.message || 'Lỗi khi đặt dịch vụ', { id: 'order-toast' });
      }
    } catch (err) {
      console.error("Submit order error:", err);
      toast.error('Lỗi kết nối máy chủ', { id: 'order-toast' });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-pink-500">verified</span>
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Dịch vụ Ngâm Tích Xanh Instagram</span>
            </div>

            {/* Service Option */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Lựa chọn gói dịch vụ :
              </label>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-pink-500">sync</span>
                    <span className="text-sm italic">Đang tải cấu hình giá...</span>
                  </div>
                ) : services.length === 0 ? (
                  <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm italic">
                    Hiện tại dịch vụ này đang bảo trì. Vui lòng quay lại sau.
                  </div>
                ) : (
                  services.map((service) => (
                    <div 
                      key={service._id} 
                      onClick={() => !service.isMaintenance && setSelectedService(service)}
                      className={`p-4 border rounded-xl transition-all flex items-center justify-between group ${
                        service.isMaintenance 
                          ? 'opacity-60 grayscale cursor-not-allowed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50'
                          : selectedService?._id === service._id 
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10 shadow-md cursor-pointer' 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:border-pink-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                          {service.name}
                        </span>
                        {service.description && (
                          <span className="text-[10px] text-slate-500 line-clamp-1">{service.description}</span>
                        )}
                        {service.status && (
                          <span className={`${service.isMaintenance ? 'bg-red-500' : 'bg-green-500'} text-white px-2 py-0.5 rounded text-xs w-fit`}>
                            {service.status}
                          </span>
                        )}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                        selectedService?._id === service._id && !service.isMaintenance
                          ? 'bg-pink-500 text-white' 
                          : 'bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30'
                      }`}>
                        {service.price.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* URL Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                URL Instagram cá nhân/Brand cần ngâm:
              </label>
              <input
                type="text"
                name="targetUrl"
                value={formData.targetUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder="Ví dụ: https://www.instagram.com/username/..."
              />
            </div>

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tài khoản Instagram:
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Email hoặc tên đăng nhập"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mật khẩu Instagram:
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Mật khẩu Instagram"
                />
              </div>
            </div>

            {/* 2FA */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mã 2FA (nếu có):
              </label>
              <input
                type="text"
                name="twoFaCode"
                value={formData.twoFaCode}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
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
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-none"
                placeholder="Ví dụ: Cần ngâm để lên tích xanh nhanh nhất có thể..."
              ></textarea>
            </div>

            {/* Contact Info */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Link facebook hoặc sdt zalo để liên hệ:
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                placeholder="Nhập link Facebook hoặc SĐT Zalo của bạn..."
              />
            </div>

            {/* Coupon and Price Preview */}
            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mã giảm giá (nếu có):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-pink-500 transition-all ${
                      couponError ? 'border-red-500' : hasDiscount ? 'border-green-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="Nhập mã giảm giá..."
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined animate-spin text-pink-500 text-sm">sync</span>
                    </div>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-red-500 mt-1 font-medium">{couponError}</p>}
                {isCouponApplied && <p className="text-[10px] text-green-500 mt-1 font-medium">Đã áp dụng mã giảm giá!</p>}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">
                  Tổng thanh toán: <span className="text-pink-600 dark:text-pink-400">
                    {hasDiscount ? (
                      <>
                        <span className="line-through opacity-50 mr-2 text-sm text-slate-400 font-normal">{originalPrice.toLocaleString('vi-VN')}</span>
                        {discountedPrice.toLocaleString('vi-VN')}
                      </>
                    ) : (
                      originalPrice.toLocaleString('vi-VN')
                    )} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={selectedService?.isMaintenance}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span className="material-symbols-outlined text-pink-500">info</span>
              Hướng dẫn đặt hàng
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 size-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Nhập đúng thông tin yêu cầu</div>
                  <p className="text-xs text-slate-500 leading-relaxed">Nhập đúng thông tin nick instagram bạn để hệ thống tự setup ngâm cho bạn</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 size-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Đặt 2FA an toàn</div>
                  <p className="text-xs text-slate-500 leading-relaxed">2FA kèm theo để hệ thống cho thể truy cập vào dễ dàng hơn để ngâm cho bạn</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 size-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
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
      <OrderSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
};

export default InstagramBlue;
