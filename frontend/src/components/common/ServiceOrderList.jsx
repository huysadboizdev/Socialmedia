import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ServiceOrderList = ({ serviceType }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For detail view
  const [filters, setFilters] = useState({
    limit: '10',
    fromDate: '',
    toDate: '',
    status: 'Tất cả',
    search: ''
  });
  const [reportOrder, setReportOrder] = useState(null);
  const [reportIssue, setReportIssue] = useState('');
  const [reportNote, setReportNote] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const columns = [
    'STT', 'THAO TÁC', 'MÃ ĐƠN HÀNG', 'LINK/UID', 'MÁY CHỦ', 
    'SỐ LƯỢNG', 'GIÁ TIỀN', 'TRẠNG THÁI', 'THỜI GIAN TẠO', 'GHI CHÚ'
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/api/user/service`, { 
          action: 'getOrderHistory' 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          let fetchedOrders = res.data.orders;
          
          // Filter based on serviceType
          if (serviceType !== 'ALL') {
             const [platformKey, categoryKey] = serviceType.split('_');
             
             // 1. Filter by Platform
             const platformMap = {
               'facebook': 'Facebook',
               'instagram': 'Instagram',
               'tiktok': 'TikTok',
               'shopee': 'Shopee',
               'telegram': 'Telegram',
               'youtube': 'Youtube'
             };
             
             const targetPlatform = platformMap[platformKey];
             
             if (targetPlatform) {
               fetchedOrders = fetchedOrders.filter(o => o.service?.platform === targetPlatform);
             }

             // 2. Filter by Category Keywords
             // Map action keys to possible keywords in the database category string
             const categoryKeywords = {
               'like': ['like', 'cảm xúc'],
               'share': ['share', 'chia sẻ'],
               'follow': ['follow', 'theo dõi', 'sub'],
               'comment': ['comment', 'bình luận'],
               'view': ['view', 'lượt xem'],
               'member': ['member', 'thành viên', 'group'],
               'vip': ['vip'],
               'eye': ['mắt', 'live']
             };

             const keywords = categoryKeywords[categoryKey];
             
             if (keywords && keywords.length > 0) {
               fetchedOrders = fetchedOrders.filter(o => {
                 const serviceCategory = o.service?.category?.toLowerCase() || '';
                 return keywords.some(k => serviceCategory.includes(k));
               });
             }
          }

          setOrders(fetchedOrders.reverse()); // Show newest first
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
        toast.error("Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, serviceType]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Filter logic for local state
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filters.status !== 'Tất cả') {
       // Map backend status to frontend display status if they differ
       // or assume they match for now
       if (order.status !== filters.status && 
           !(filters.status === 'Đang chạy' && order.status === 'Pending') // Example mapping
          ) {
         return false;
       }
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const codeMatch = order._id.toLowerCase().includes(searchLower);
      const linkMatch = order.link?.toLowerCase().includes(searchLower);
      return codeMatch || linkMatch;
    }

    // Date filter (optional implementation)
    // ...

    return true;
  });

  const handleReportSubmit = async () => {
    if (!reportIssue) {
        toast.error("Vui lòng chọn vấn đề cần báo cáo");
        return;
    }

    try {
        setIsReporting(true);
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/api/user/service`, { 
            action: 'reportOrder',
            orderId: reportOrder._id,
            issue: reportIssue,
            reportNote: reportNote
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
            toast.success(res.data.message);
            setReportOrder(null);
            setReportIssue('');
            setReportNote('');
        } else {
            toast.error(res.data.message || "Có lỗi xảy ra");
        }
    } catch (error) {
        console.error("Report error:", error);
        toast.error("Lỗi kết nối đến máy chủ");
    } finally {
        setIsReporting(false);
    }
  };

  const displayedOrders = filteredOrders.slice(0, parseInt(filters.limit));

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hiển thị</label>
          <Select value={filters.limit} onValueChange={(v) => handleFilterChange('limit', v)}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label>
          <input
            type="date"
            className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label>
          <input
            type="date"
            className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tất cả">Tất cả</SelectItem>
              <SelectItem value="Pending">Đang chờ</SelectItem>
              <SelectItem value="Processing">Đang chạy</SelectItem>
              <SelectItem value="Completed">Hoàn thành</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tìm Kiếm Đơn</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập mã đơn hoặc link..."
              className="w-full h-9 pl-3 pr-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <button className="absolute right-0 top-0 h-full px-3 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition-colors">
              <span className="material-symbols-outlined text-[18px] leading-none">search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-center py-4 whitespace-nowrap">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                 <TableCell colSpan={columns.length} className="h-32 text-center text-slate-500">
                   Đang tải dữ liệu...
                 </TableCell>
              </TableRow>
            ) : displayedOrders.length > 0 ? (
              displayedOrders.map((order, index) => (
                <TableRow key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell className="text-center">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-1.5 rounded-full transition-all"
                      title="Xem chi tiết"
                    >
                       <span className="material-symbols-outlined text-[20px]">info</span>
                    </button>
                    {/* Report Button */}
                     <button 
                      onClick={() => {
                          setReportOrder(order);
                          setReportIssue('');
                          setReportNote('');
                      }}
                      className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 p-1.5 rounded-full transition-all ml-1"
                      title="Báo lỗi"
                    >
                       <span className="material-symbols-outlined text-[20px]">flag</span>
                    </button>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-slate-500">
                    {order._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-blue-600">
                     <a href={order.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {order.link}
                     </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium">
                      {order.service?.name || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-700 dark:text-slate-200">
                    {order.quantity?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-bold text-red-500 text-xs">
                    {order.totalPrice?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600' // Pending
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-500">
                    {order.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-500 max-w-[150px] truncate">
                    {order.note || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                    <div className="relative">
                      <span className="material-symbols-outlined text-[80px]">inventory_2</span>
                      <span className="material-symbols-outlined absolute bottom-0 right-0 text-[24px] bg-slate-100 dark:bg-slate-800 rounded-full p-1 transform translate-x-1/4 translate-y-1/4">
                          more_horiz
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Không có dữ liệu</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600">info</span>
              Chi tiết đơn hàng {selectedOrder?._id.slice(-6).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Người dùng</label>
                   <div className="font-medium text-slate-700 dark:text-slate-200">
                     {/* Show 'active user' since this is user panel, or passed user info if available */}
                     Me
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Thời gian tạo</label>
                   <div className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                     {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString('vi-VN') : 'N/A'}
                   </div>
                 </div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 break-all">
                <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                   <span className="material-symbols-outlined text-[14px]">link</span> Link mục tiêu
                </label>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {selectedOrder.link || 'Không có link'}
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                   <span className="material-symbols-outlined text-[14px]">description</span> Ghi chú
                </label>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedOrder.note || 'Không có ghi chú'}
                </div>
              </div>
              
               <div className="space-y-1  bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                 <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chi tiết kỹ thuật</label>
                 <div className="text-xs text-slate-500  font-mono">
                   ID: {selectedOrder._id} <br/>
                   Server: {selectedOrder.service?.name}
                 </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    {/* Report Dialog */}
      <Dialog open={!!reportOrder} onOpenChange={(open) => !open && setReportOrder(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500">warning</span>
              Báo lỗi đơn hàng {reportOrder?._id.slice(-6).toUpperCase()}
            </DialogTitle>
             <p className="text-sm text-slate-500 dark:text-slate-400">
                Hãy cung cấp thông tin chi tiết về vấn đề của bạn để chúng tôi hỗ trợ nhanh nhất.
             </p>
          </DialogHeader>
          
          {reportOrder && (
          <div className="space-y-4 pt-2">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vấn đề gặp phải</label>
                <Select value={reportIssue} onValueChange={setReportIssue}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Chọn vấn đề..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chưa chạy">Đơn hàng chưa chạy</SelectItem>
                    <SelectItem value="Lên thiếu">Lên được 1 phần rồi dừng (Thiếu số lượng)</SelectItem>
                    <SelectItem value="Huỷ đơn">Yêu cầu huỷ đơn hàng</SelectItem>
                    <SelectItem value="Bảo hành">Yêu cầu bảo hành (Tụt)</SelectItem>
                    <SelectItem value="Khác">Vấn đề khác</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Chi tiết / Ghi chú thêm</label>
                <textarea 
                    className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                />
             </div>

             <div className="flex justify-end gap-3 pt-2">
                <button 
                    onClick={() => setReportOrder(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                    Đóng
                </button>
                <button 
                    onClick={handleReportSubmit}
                    disabled={isReporting}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-orange-500/20 flex items-center gap-2"
                >
                    {isReporting && <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>}
                    Gửi Báo Cáo
                </button>
             </div>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceOrderList;
