import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    systemBalance: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStatsData(res.data.stats);
          setRecentOrders(res.data.recentOrders);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL]);

  const stats = [
    { label: "Tổng Thành Viên", value: statsData.totalUsers.toLocaleString(), icon: "group", color: "bg-blue-500/10 text-blue-500" },
    { label: "Đơn Hàng Hôm Nay", value: statsData.todayOrders.toLocaleString(), icon: "shopping_cart", color: "bg-green-500/10 text-green-500" },
    { label: "Doanh Thu Tháng", value: `${statsData.monthlyRevenue.toLocaleString()} ₫`, icon: "payments", color: "bg-purple-500/10 text-purple-500" },
    { label: "Số Dư Hệ Thống", value: `${statsData.systemBalance.toLocaleString()} ₫`, icon: "account_balance", color: "bg-orange-500/10 text-orange-500" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-full transition-colors duration-300 bg-[#f8f9fa] dark:bg-slate-950">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Trang Quản Trị</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Chào mừng quay trở lại, đây là tổng quan hệ thống của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-5 transition-all hover:border-slate-200 dark:hover:border-slate-700">
            <div className={`size-14 rounded-xl flex items-center justify-center ${stat.color}`}>
              <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 min-h-[400px]">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Đơn Hàng Gần Đây</h3>
             {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-6xl animate-spin opacity-20">sync</span>
                    <p className="mt-4 font-medium opacity-50">Đang tải dữ liệu...</p>
                </div>
             ) : recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-6xl opacity-20">history</span>
                    <p className="mt-4 font-medium opacity-50">Chưa có đơn hàng nào.</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 dark:text-slate-500 text-xs uppercase font-bold border-b border-slate-100 dark:border-slate-800">
                                <th className="pb-4">Người dùng</th>
                                <th className="pb-4">Dịch vụ</th>
                                <th className="pb-4">Số lượng</th>
                                <th className="pb-4">Tổng tiền</th>
                                <th className="pb-4">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {recentOrders.map((order, i) => (
                                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                    <td className="py-4 font-medium text-slate-700 dark:text-slate-200">{order.userId?.username || 'N/A'}</td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 dark:text-slate-200">{order.service?.name}</span>
                                            <span className="text-xs text-slate-400 uppercase">{order.service?.platform}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-slate-600 dark:text-slate-400">{order.quantity.toLocaleString()}</td>
                                    <td className="py-4 font-bold text-slate-700 dark:text-slate-200">{order.totalPrice.toLocaleString()} ₫</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                            order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                            order.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
             <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Hoạt Động Hệ Thống</h3>
             <div className="space-y-6">
                 {[1,2,3,4].map(i => (
                     <div key={i} className="flex gap-4 border-l-2 border-slate-100 dark:border-slate-800 pl-6 relative">
                         <div className="absolute -left-[5px] top-1 size-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                         <div className="flex flex-col gap-1">
                             <span className="text-xs text-slate-400 dark:text-slate-500 font-medium tracking-tight">10 phút trước</span>
                             <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">Bản tin hệ thống {i}</p>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
