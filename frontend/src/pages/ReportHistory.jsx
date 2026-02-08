import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
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

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    limit: '10',
    fromDate: '',
    toDate: '',
    status: 'Tất cả',
    search: ''
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const columns = [
    'STT', 'MÃ ĐƠN HÀNG', 'DỊCH VỤ', 'VẤN ĐỀ', 'GHI CHÚ CỦA BẠN', 'TRẠNG THÁI', 'THỜI GIAN BÁO', 'PHẢN HỒI ADMIN'
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.post(`${API_URL}/api/user/service`, { 
          action: 'getReportedOrders' 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setReports(res.data.orders);
        }
      } catch (error) {
        console.error("Fetch reports error:", error);
        toast.error("Không thể tải lịch sử báo lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [API_URL]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Client-side filtering
  const filteredReports = reports.filter(order => {
    // Status filter
    if (filters.status !== 'Tất cả') {
       if (order.report?.status !== (filters.status === 'Đã xử lý' ? 'resolved' : 'pending')) {
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

    // Date filters could be added here
    return true;
  });

  const displayedReports = filteredReports.slice(0, parseInt(filters.limit));

  return (
    <div className="h-full flex flex-col space-y-4">
       {/* Breadcrumb / Title */}

       {/* Title Card */}
       <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase">
            DANH SÁCH ĐƠN HÀNG ĐÃ BÁO LỖI
          </h1>
       </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex-1">
        
        {/* Filters */}
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
                <SelectItem value="Resolved">Đã xử lý</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tìm Kiếm Đơn</label>
            <div className="relative">
                <input
                type="text"
                placeholder="Nhập mã đơn..."
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

        {/* Table */}
        <div className="overflow-hidden">
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
                ) : displayedReports.length > 0 ? (
                displayedReports.map((order, index) => (
                    <TableRow key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-slate-500">
                        {order._id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-center">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium">
                        {order.service?.name || 'Unknown'}
                        </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-red-500 text-sm">
                        {order.report?.message}
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500 max-w-[200px] truncate" title={order.report?.note}>
                        {order.report?.note || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        order.report?.status === 'resolved' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                        }`}>
                        {order.report?.status === 'resolved' ? 'Success' : 'Pending'}
                        </span>
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500">
                        {order.report?.createdAt ? new Date(order.report.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-xs text-blue-600 italic max-w-[200px] truncate" title={order.report?.adminResponse}>
                        {order.report?.adminResponse || 'Chưa có phản hồi'}
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                        <div className="relative">
                        <span className="material-symbols-outlined text-[80px]">fact_check</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Bạn chưa báo lỗi đơn hàng nào</p>
                    </div>
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
};

export default ReportHistory;
