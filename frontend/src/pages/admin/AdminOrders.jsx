import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/manage-order`, { action: 'getAllOrders' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/manage-order`, { 
        action: 'updateOrderStatus',
        orderId,
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Đã cập nhật trạng thái đơn hàng");
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/manage-order`, { 
        action: 'deleteOrder',
        orderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Đã xóa đơn hàng");
        setOrders(orders.filter(o => o._id !== orderId));
      }
    } catch {
      toast.error("Lỗi khi xóa đơn hàng");
    }
  };

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Theo dõi và cập nhật tiến độ đơn hàng cho tất cả thành viên.</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', ...statusOptions].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filterStatus === status 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-purple-500/50'
              }`}
            >
              {status === 'All' ? 'Tất cả' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
            <span className="material-symbols-outlined text-5xl animate-spin opacity-20">sync</span>
            <p className="mt-4 font-medium opacity-50">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Mã / Ngày</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Dịch vụ</th>
                  <th className="px-6 py-4">Số lượng</th>
                  <th className="px-6 py-4">Thanh toán</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                      Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">#{order._id.slice(-6)}</span>
                            <span className="text-xs text-slate-500">{new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className="font-medium text-slate-700 dark:text-slate-200">
                             {order.userId?.username || 'Unknown'}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{order.service?.name || 'Service Deleted'}</span>
                            <span className="text-[10px] uppercase text-slate-400 font-bold">{order.service?.platform}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {order.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-white">{order.totalPrice.toLocaleString()} ₫</span>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all outline-none border-0 ring-1 cursor-pointer ${
                              order.status === 'Completed' ? 'bg-green-500/10 text-green-500 ring-green-500/20' :
                              order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 ring-yellow-500/20' :
                              order.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 ring-blue-500/20' :
                              'bg-red-500/10 text-red-500 ring-red-500/20'
                            }`}
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                // Toggle expanded detail view for this order
                                setOrders(orders.map(o => o._id === order._id ? { ...o, isExpanded: !o.isExpanded } : o));
                              }}
                              className={`p-2 rounded-lg transition-all ${order.isExpanded ? 'bg-purple-100 text-purple-600' : 'text-slate-400 hover:bg-slate-100 hover:text-purple-500'}`}
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[18px]">info</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                              title="Xóa đơn"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {order.isExpanded && (
                        <tr className="bg-slate-50/30 dark:bg-slate-800/10">
                          <td colSpan="7" className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Link mục tiêu</label>
                                <div className="flex items-center gap-2">
                                  <a href={order.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-500 hover:underline break-all truncate max-w-[250px]">
                                    {order.link || 'Không có link'}
                                  </a>
                                  {order.link && (
                                    <button 
                                      onClick={() => { navigator.clipboard.writeText(order.link); toast.success("Đã copy link"); }}
                                      className="text-slate-400 hover:text-slate-600"
                                    >
                                      <span className="material-symbols-outlined text-xs">content_copy</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ghi chú người dùng</label>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                  {order.note || 'Không có ghi chú'}
                                </p>
                              </div>

                              {order.details && Object.keys(order.details).length > 0 && (
                                <div className="space-y-1 col-span-full md:col-span-1 lg:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 md:pl-6 pt-2 md:pt-0">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thông tin tài khoản (Tích Xanh)</label>
                                  <div className="space-y-2 mt-1">
                                    {Object.entries(order.details).map(([key, value]) => (
                                      <div key={key} className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-medium capitalize">{key === 'twoFaCode' ? 'Mã 2FA' : key === 'username' ? 'Tài khoản' : key === 'password' ? 'Mật khẩu' : key === 'contactInfo' ? 'Liên hệ' : key}</span>
                                        <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-lg">
                                          <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">{String(value)}</span>
                                          <button 
                                            onClick={() => { navigator.clipboard.writeText(String(value)); toast.success(`Đã copy ${key}`); }}
                                            className="text-slate-400 hover:text-slate-600"
                                          >
                                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
