import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import useCoupon from '@/hooks/useCoupon';
import ActiveCouponsList from '@/components/common/ActiveCouponsList';
import OrderSuccessModal from '@/components/common/OrderSuccessModal';
import appleIcon from '@/assets/certification.png';
import cert1 from '@/assets/chungchi1.jpg';
import cert2 from '@/assets/chungchi2.jpg';
import cert3 from '@/assets/chungchi3.jpg';
import cert4 from '@/assets/chungchi4.jpg';

const AppleCert = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    udid: '',
    contactInfo: '',
    note: '',
    discount: ''
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const { discountedPrice, originalPrice, hasDiscount, isCouponApplied, isValidating, error: couponError } = useCoupon(
    formData.discount,
    1, 
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
          const appleServices = res.data.services.filter(s => s.platform === 'Apple' && s.isActive !== false);
          setServices(appleServices);
          if (appleServices.length > 0) {
            setSelectedService(appleServices[0]);
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
    if (!formData.udid || !formData.contactInfo) {
      toast.error('Vui lòng nhập mã UDID và Thông tin liên hệ');
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
        link: formData.udid,
        note: formData.note,
        couponCode: formData.discount,
        details: {
          udid: formData.udid,
          contactInfo: formData.contactInfo
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.dismiss('order-toast');
        setShowSuccessModal(true);
        setFormData({
          udid: '',
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
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <img src={appleIcon} alt="Apple Certificate" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Dịch vụ Chứng Chỉ Apple</span>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Lựa chọn gói dịch vụ :
              </label>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-slate-600">sync</span>
                    <span className="text-sm italic">Đang tải cấu hình giá...</span>
                  </div>
                ) : services.length === 0 ? (
                  <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm italic">
                    Hiện tại dịch vụ này đang bảo trì. Vui lòng quay lại sau/Liên hệ Admin.
                  </div>
                ) : (
                  services.map((service) => (
                    <div 
                      key={service._id} 
                      onClick={() => !service.isMaintenance && setSelectedService(service)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                        service.isMaintenance 
                          ? 'opacity-50 grayscale cursor-not-allowed border-red-300 bg-red-50 dark:bg-red-900/20'
                          : selectedService?._id === service._id 
                            ? 'border-slate-500 bg-slate-50 dark:bg-slate-900 shadow-md' 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {service.name}
                        </span>
                        {service.description && (
                          <span className="text-[10px] text-slate-500 line-clamp-1">{service.description}</span>
                        )}
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                        selectedService?._id === service._id && !service.isMaintenance
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-600'
                      }`}>
                        {service.price.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Mã UDID của thiết bị:
                </label>
                <input
                  type="text"
                  name="udid"
                  value={formData.udid}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-500 transition-all font-medium text-sm"
                  placeholder="Nhập mã UDID (40 ký tự)"
                  disabled={selectedService?.isMaintenance}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Link Facebook hoặc SĐT Zalo liên hệ:
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-500 transition-all font-medium text-sm"
                  placeholder="Nhập link FB hoặc SĐT Zalo"
                  disabled={selectedService?.isMaintenance}
                />
              </div>
            </div>

            <div className="mb-8 font-medium">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Ghi chú hoặc yêu cầu thêm:
              </label>
              <textarea
                rows="3"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-500 transition-all resize-none font-medium"
                placeholder="Ví dụ: Cần gói Cert vĩnh viễn..."
                disabled={selectedService?.isMaintenance}
              ></textarea>
            </div>

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
                    className={`w-full p-3 border rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-slate-500 transition-all ${
                      couponError ? 'border-red-500' : hasDiscount ? 'border-green-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                    placeholder="Nhập mã giảm giá..."
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined animate-spin text-slate-500 text-sm">sync</span>
                    </div>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-red-500 mt-1 font-medium">{couponError}</p>}
                {isCouponApplied && <p className="text-[10px] text-green-500 mt-1 font-medium">Đã áp dụng mã giảm giá!</p>}
                  <ActiveCouponsList onApply={(code) => setFormData(prev => ({...prev, discount: code}))} appliedCouponCode={formData.discount} />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl font-bold mb-1 text-slate-800 dark:text-slate-100">
                  Tổng thanh toán: <span className="text-slate-900 dark:text-slate-100 font-bold">
                    {hasDiscount ? (
                      <>
                        <span className="line-through opacity-50 mr-2 text-sm text-slate-400 font-normal">{originalPrice.toLocaleString('vi-VN')}</span>
                        {discountedPrice.toLocaleString('vi-VN')}
                      </>
                    ) : (
                      originalPrice?.toLocaleString('vi-VN') || 0
                    )} VNĐ
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={selectedService?.isMaintenance}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đặt Chứng Chỉ ngay
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-500">visibility</span>
              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Xem trước giao diện Chứng Chỉ</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[cert1, cert2, cert3, cert4].map((img, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <img 
                    src={img} 
                    alt={`Cert Preview ${idx + 1}`} 
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-sm tracking-widest uppercase">Apple Certificate</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-5 shadow-sm font-medium">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">priority_high</span>
              Lưu ý khi mua Cert
            </h3>
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <p>• Cần nhập UDID chính xác, sai UDID không được hoàn tiền.</p>
              <p>• Nhập thông tin liên hệ để Admin thông báo khi có Cert.</p>
              <p>• Thời gian cấp Cert từ 24h - 72h theo quy định Apple.</p>
              <p>• Bảo hành 1 năm cho tất cả các loại Cert.</p>
            </div>
          </div>
        </div>
      </div>
      <OrderSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
};

export default AppleCert;
