import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import ServiceOrderList from '@/components/common/ServiceOrderList';
import { validateLink } from '@/lib/validation';

const FacebookFollow = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
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
          const fbFollowServices = res.data.services.filter(s => 
            s.platform === 'Facebook' && 
            s.isActive !== false && 
            (s.category === 'Tăng Theo Dõi' || s.category === 'Tăng Theo Dõi' || s.category === 'Tăng Follower')
          );
          setServices(fbFollowServices.map(s => ({
            id: s._id,
            name: s.name,
            label: s.description || s.name,
            price: s.price,
            status: s.isMaintenance ? 'Bảo trì' : (s.isActive ? 'Hoạt động' : 'Tắt'),
            isMaintenance: s.isMaintenance === true,
            speed: s.speed
          })));
          if (fbFollowServices.length > 0) {
            setSelectedServer(fbFollowServices[0]._id);
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
      toast.error('Vui lòng nhập Link hoặc UID bài viết/trang cá nhân');
      return;
    }
    if (!validateLink(formData.link, 'facebook')) {
      toast.error('Link Facebook không hợp lệ!');
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
    if (!selectedServer) {
      toast.error('Vui lòng chọn máy chủ');
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
        toast.success('Tạo đơn hàng thành công!', { id: 'order-toast' });
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
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className={`${activeTab === 'create' ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-6`}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-3 px-4 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-400 text-white hover:bg-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span> Khởi Tạo Đơn
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-3 px-4 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-transparent text-purple-600 hover:bg-purple-50 border-2 border-purple-600'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">receipt_long</span> Danh Sách Đơn
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            {/* Multi-order badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Bạn có thể :</span>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Mua nhiều đơn cùng lúc
              </span>
            </div>

            {/* Link Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                Link Hoặc UID
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full p-3 border border-purple-300 dark:border-purple-800 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                placeholder="Nhập link hoặc UID bài viết..."
              />
            </div>

            {/* Server List */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Máy Chủ :
              </label>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-slate-400">
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    <span className="text-sm">Đang tải danh sách máy chủ...</span>
                  </div>
                ) : services.length === 0 ? (
                  <div className="py-4 text-slate-500 text-sm italic">Không có máy chủ nào khả dụng</div>
                ) : (
                  services.map((server) => (
                    <div key={server.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="server"
                        id={server.id}
                        checked={selectedServer === server.id}
                        onChange={() => setSelectedServer(server.id)}
                        disabled={server.isMaintenance}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label htmlFor={server.id} className={`flex flex-wrap items-center gap-2 cursor-pointer select-none text-sm ${server.isMaintenance ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}>
                        <span className="font-bold text-orange-500 px-2 py-0.5 rounded border border-orange-200 bg-orange-50 text-xs text-center min-w-[50px]">
                          {server.name}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {server.label}
                        </span>
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                          {server.price}đ
                        </span>
                        <span className={`${server.isMaintenance ? 'bg-red-500' : 'bg-green-500'} text-white px-2 py-0.5 rounded text-xs`}>
                          {server.status}
                        </span>
                        {server.speed && (
                           <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200 dark:border-slate-700 italic">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  Số Lượng : ( 1,000 - 1,000,000 )
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-purple-300 dark:border-purple-800 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Nhập số lượng..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  Mã giảm giá
                </label>
                <input
                  type="text"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-purple-300 dark:border-purple-800 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Nhập mã giảm giá..."
                />
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                Ghi chú
              </label>
              <textarea
                rows="4"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="w-full p-3 border border-purple-300 dark:border-purple-800 rounded bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Nhập ghi chú (nếu có)..."
              ></textarea>
            </div>

            {/* Total Footer */}
            <div className="bg-purple-600 text-white p-4 rounded-lg mb-4 text-center">
              <div className="text-xl font-bold mb-1">
                Tổng thanh toán: <span className="text-yellow-300">{totalPrice.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="text-sm opacity-90">
                Cho <span className="font-bold">{formData.quantity || 0}</span> Lượt tương tác
              </div>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={currentServer?.isMaintenance}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              Tạo đơn hàng
            </button>
          </div>
          ) : (
            <ServiceOrderList serviceType="facebook_follow" />
          )}
        </div>

        {/* Sidebar - Right Side */}
        {activeTab === 'create' && (
          <div className="xl:col-span-1 space-y-6">
            {/* Instructions */}
            <div className="bg-sky-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-lg p-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Hướng dẫn</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Đơn Lỗi Báo Ngay SUPER ADMIN
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 border-b border-red-200 dark:border-red-800 pb-2">LƯU Ý!</h3>
              <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span>
                    Nghiêm cấm buff các đơn có nội dung vi phạm pháp luật, chính trị, đồi trụy... Nếu cố tình buff bạn sẽ bị trừ hết tiền và ban khỏi hệ thống vĩnh viễn, và phải chịu hoàn toàn trách nhiệm trước pháp luật.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span>
                    Nếu đơn đang chạy trên hệ thống mà bạn vẫn mua ở các hệ thống bên khác, nếu có tình trạng hụt, thiếu số lượng giữa 2 bên thì sẽ không được xử lí.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-500">•</span>
                  <span>
                    Đơn cài sai thông tin hoặc lỗi trong quá trình tăng hệ thống sẽ không hoàn lại tiền.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookFollow;
