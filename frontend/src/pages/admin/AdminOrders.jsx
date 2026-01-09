import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.userId?.username && o.userId.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = orderDate === '' || new Date(o.orderDate).toISOString().split('T')[0] === orderDate;
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrders(paginatedOrders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const toggleSelectOrder = (orderId, checked) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const statusOptions = ["Pending", "In Progress", "Completed", "Cancelled"];

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Danh sách tất cả đơn hàng</p>
        </div>
        <Button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm rounded-lg flex items-center gap-2 h-9 px-4">
           <span className="material-symbols-outlined text-sm">add</span>
           Tạo đơn
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <Input 
            placeholder="Tìm mã đơn hàng, tên, SĐT..." 
            className="pl-9 bg-white border-slate-200 h-9 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] bg-white border-slate-200 h-9 rounded-lg">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tất cả</SelectItem>
            {statusOptions.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative w-full max-w-[180px]">
          <Input 
            type="text"
            placeholder="Ngày đặt hàng"
            onFocus={(e) => (e.target.type = 'date')}
            onBlur={(e) => (e.target.type = 'text')}
            className="bg-white border-slate-200 h-9 rounded-lg pr-9"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">calendar_month</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#990033] hover:bg-[#990033] border-0">
                <TableHead className="w-12 text-center text-white">
                  <Checkbox 
                    checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#990033]"
                  />
                </TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Mã đơn hàng</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Người nhận</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Tổng tiền</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Ngày đặt</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Nhân viên</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Trạng thái</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex justify-center">
                      <span className="material-symbols-outlined animate-spin text-slate-400 text-4xl">sync</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center text-slate-500 italic">
                    Không tìm thấy đơn hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedOrders.includes(order._id)}
                        onCheckedChange={(checked) => toggleSelectOrder(order._id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm font-medium text-slate-700">#{order._id.slice(-6).toUpperCase()}</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-sm text-slate-600">{order.userId?.username || 'Guest'}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-slate-800">{order.totalPrice.toLocaleString()} ₫</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-600">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-slate-500 italic">Admin</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <select 
                        className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-all outline-none border cursor-pointer ${
                          order.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' :
                          order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          order.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-red-50 text-red-600 border-red-200'
                        }`}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="size-8 text-slate-400 hover:text-purple-600"
                          onClick={() => {}}
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="size-8 text-slate-400 hover:text-red-500"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination Section */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
          <div className="text-sm text-slate-500">
            Đã chọn {selectedOrders.length} trong {paginatedOrders.length} hàng.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Tổng: {filteredOrders.length}</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] bg-white border-slate-200 h-8 rounded text-xs">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                Trang {currentPage}/{totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
