import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import ServiceOrderList from '@/components/common/ServiceOrderList';
import { validateLink } from '@/lib/validation';
import OrderSuccessModal from '@/components/common/OrderSuccessModal';

const InstagramLike = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState('');
  const [formData, setFormData] = useState({
    link: '',
    quantity: '',
    discount: '',
    note: ''
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/api/user/service`, { action: 'getServices' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const igLikeServices = res.data.services.filter(s => 
            s.platform === 'Instagram' && 
            s.isActive !== false && 
            (s.category === 'Tăng Like' || s.category === 'Like Bài Viết' || s.category === 'Like')
          );
          setServices(igLikeServices.map(s => ({
            id: s._id,
            name: s.name,
            label: s.description || s.name,
            price: s.price,
            status: s.isMaintenance ? 'Bảo trì' : (s.isActive ? 'Hoạt động' : 'Tắt'),
            isMaintenance: s.isMaintenance === true,
            speed: s.speed
          })));
          if (igLikeServices.length > 0) {
            setSelectedServer(igLikeServices[0]._id);
          }
        }
      } catch (err) {
        console.error("Fetch services error:", err);
        toast.error("Không thể tải danh sách máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [API_URL]);

  const currentServer = services.find(s => s.id === selectedServer) || services[0];

  const totalPrice = (parseInt(formData.quantity) || 0) * (currentServer?.price || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.link) {
      toast.error('Vui lòng nhập Link bài viết');
      return;
    }
    if (!validateLink(formData.link, 'instagram')) {
      toast.error('Link Instagram không hợp lệ!');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 1000) {
      toast.error('Số lượng tối thiểu là 1,000');
      return;
    }
    if (parseInt(formData.quantity) > 1000000) {
      toast.error('Số lượng tối đa là 1,000,000');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      toast.loading('Đang xử lý đơn hàng...', { id: 'order-toast' });
      
      const res = await axios.post(`${API_URL}/api/user/service`, {
        action: 'createOrder',
        serviceId: selectedServer,
        quantity: parseInt(formData.quantity),
        link: formData.link,
        note: formData.note
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (currentServer?.isMaintenance) {
        toast.error('Máy chủ này đang bảo trì, vui lòng chọn máy chủ khác', { id: 'order-toast' });
        return;
      }

      if (res.data.success) {
        toast.dismiss('order-toast');
        setShowSuccessModal(true);
        setFormData({ link: '', quantity: '', discount: '', note: '' });
      } else {
        toast.error(res.data.message || 'Lỗi khi tạo đơn hàng', { id: 'order-toast' });
      }
    } catch (err) {
      console.error("Submit order error:", err);
      toast.error('Lỗi kết nối máy chủ', { id: 'order-toast' });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className={`${activeTab === 'create' ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-6`}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-[#6f42c1] text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-400 text-white hover:bg-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span> Khởi Tạo Đơn
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-3 px-4 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-[#6f42c1] text-white shadow-lg shadow-purple-500/30'
                  : 'bg-transparent text-[#6f42c1] hover:bg-purple-50 border-2 border-[#6f42c1]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">history</span> Danh Sách Đơn
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
               {/* Badge */}
               <div className="flex items-center gap-2 mb-8">
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Bạn có thể :</span>
                <span className="bg-[#5a32a3] text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md shadow-purple-500/20">
                  Mua nhiều đơn cùng lúc
                </span>
              </div>

              {/* Link Input */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#6f42c1] dark:text-purple-400 mb-2.5">
                  Link Hoặc UID
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-[#6f42c1] rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-semibold text-slate-700 placeholder:font-normal"
                  placeholder="Nhập link hoặc UID bài viết..."
                />
              </div>

              {/* Server List */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">
                  Máy Chủ :
                </label>
                <div className="space-y-3">
                  {loading ? (
                    <div className="flex items-center gap-2 py-4 text-slate-400">
                      <span className="material-symbols-outlined animate-spin">sync</span>
                      <span className="text-sm font-medium">Đang tải danh sách máy chủ...</span>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl mb-2">inventory_2</span>
                      <p className="text-slate-500 dark:text-slate-400 font-medium italic">Hiện chưa có máy chủ nào khả dụng</p>
                    </div>
                  ) : (
                    services.map((server) => (
                      <div key={server.id} className="group relative">
                        <input
                          type="radio"
                          name="server"
                          id={server.id}
                          checked={selectedServer === server.id}
                          onChange={() => setSelectedServer(server.id)}
                          disabled={server.isMaintenance}
                          className="peer absolute opacity-0 cursor-pointer inset-0 z-10 disabled:cursor-not-allowed"
                        />
                        <label 
                          htmlFor={server.id} 
                          className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedServer === server.id 
                              ? 'border-[#6f42c1] bg-purple-50/50 dark:bg-purple-900/10' 
                              : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                          } ${server.isMaintenance ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                             selectedServer === server.id ? 'border-[#6f42c1]' : 'border-slate-300'
                          }`}>
                            {selectedServer === server.id && <div className="w-2.5 h-2.5 rounded-full bg-[#6f42c1]" />}
                          </div>

                          <span className="font-bold text-white px-2.5 py-1 rounded bg-[#f97316] text-xs shadow-md shadow-orange-500/20 min-w-[50px] text-center">
                            {server.name}
                          </span>
                          
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm flex-1">
                             {server.label.includes('|') ? server.label.split('|').map((part, index) => (
                                <span key={index} className={index > 0 ? "border-l border-slate-300 pl-2 ml-2 border-r pr-2 mr-2 last:border-0 last:mr-0 last:pr-0" : "mr-2 pr-2 border-r border-slate-300"}>
                                    {part.trim()}
                                </span>
                            )) : server.label}
                          </span>

                          <span className="bg-[#6f42c1] text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md shadow-purple-500/20">
                            {server.price}đ
                          </span>

                          <span className={`${server.isMaintenance ? 'bg-red-500' : 'bg-[#22c55e]'} text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md shadow-green-500/20`}>
                            {server.status}
                          </span>
                          {server.speed && (
                             <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200 dark:border-slate-700 italic">
                               {server.speed}
                             </span>
                          )}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quantity and Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-[#2e1065] dark:text-purple-400 mb-2.5">
                    Số Lượng : ( 1,000 - 1,000,000 )
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-[#6f42c1] rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-semibold"
                    placeholder="Nhập số lượng..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#2e1065] dark:text-purple-400 mb-2.5">
                    Mã giảm giá
                  </label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-[#6f42c1] rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-semibold"
                    placeholder="Nhập mã giảm giá..."
                  />
                </div>
              </div>

              {/* Note */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-[#2e1065] dark:text-purple-400 mb-2.5">
                  Ghi chú
                </label>
                <textarea
                  rows="4"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-[#6f42c1] rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all resize-none font-medium"
                  placeholder="Nhập ghi chú (nếu có)..."
                ></textarea>
              </div>

              {/* Total Footer */}
              <div className="bg-[#6610f2] text-white p-6 rounded-xl mb-6 text-center shadow-xl shadow-purple-500/20">
                <div className="text-2xl font-bold mb-2">
                  Tổng thanh toán: <span className="text-[#ffc107]">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="font-medium opacity-90">
                  Cho <span className="font-bold text-[#ffc107]">{formData.quantity || 0}</span> Lượt tương tác
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={currentServer?.isMaintenance}
                className="w-full py-4 bg-[#6610f2] hover:bg-[#520dc2] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined filled">shopping_cart</span>
                Tạo đơn hàng
              </button>
            </div>
          ) : (
            <ServiceOrderList serviceType="instagram_like" />
          )}

        </div>

        {/* Sidebar - Right Side */}
        {activeTab === 'create' && (
          <div className="xl:col-span-1 space-y-6">
            {/* Instructions */}
            <div className="bg-[#ccf2ff] border border-[#b8daff] rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-[#004085] mb-3 text-lg">Hướng dẫn</h3>
              <p className="text-sm font-medium text-[#004085]">
                Đơn Lỗi Báo Ngay ADMIN
              </p>
            </div>

            {/* Warning */}
            <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-[#721c24] mb-4 border-b border-[#f5c6cb] pb-3 text-lg">LƯU Ý!</h3>
              <ul className="space-y-4 text-sm font-medium text-[#721c24]">
                <li className="flex gap-2">
                  <span className="text-[#721c24] mt-0.5">•</span>
                  <span>
                    Nghiêm cấm buff các đơn có nội dung vi phạm pháp luật, chính trị, đồi trụy... Nếu cố tình buff bạn sẽ bị trừ hết tiền và ban khỏi hệ thống vĩnh viễn, và phải chịu hoàn toàn trách nhiệm trước pháp luật.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#721c24] mt-0.5">•</span>
                  <span>
                    Nếu đơn đang chạy trên hệ thống mà bạn vẫn mua ở các hệ thống bên khác, nếu có tình trạng hụt, thiếu số lượng giữa 2 bên thì sẽ không được xử lí.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#721c24] mt-0.5">•</span>
                  <span>
                    Đơn cài sai thông tin hoặc lỗi trong quá trình tăng hệ thống sẽ không hoàn lại tiền.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <OrderSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
};

export default InstagramLike;
