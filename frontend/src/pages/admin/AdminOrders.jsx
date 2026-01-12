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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

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
    <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-slate-950 min-h-full transition-colors duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Danh sách tất cả đơn hàng</p>
        </div>
        <Button className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm rounded-lg flex items-center gap-2 h-9 px-4 transition-all">
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
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg focus-visible:ring-violet-500/20 dark:text-slate-200 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg dark:text-slate-200 transition-all">
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
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg pr-9 dark:text-slate-200 transition-all"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">calendar_month</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm transition-all">
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
                /* ... loading state ... */
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex justify-center">
                      <span className="material-symbols-outlined animate-spin text-slate-400 text-4xl">sync</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedOrders.length === 0 ? (
                /* ... empty state ... */
                <TableRow>
                   <TableCell colSpan={8} className="h-64 text-center text-slate-500 italic">
                    Không tìm thấy đơn hàng nào.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    {/* ... other cells ... */}
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedOrders.includes(order._id)}
                        onCheckedChange={(checked) => toggleSelectOrder(order._id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 tracking-tight">#{order._id.slice(-6).toUpperCase()}</span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-sm text-slate-600 dark:text-slate-400">{order.userId?.username || 'Guest'}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">{order.totalPrice.toLocaleString()} ₫</span>
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
                          onClick={() => handleViewOrder(order)}
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
        {/* ... existing pagination code ... */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 transition-all">
          <div className="text-sm text-slate-500 dark:text-slate-500">
            Đã chọn {selectedOrders.length} trong {paginatedOrders.length} hàng.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-500">Tổng: {filteredOrders.length}</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-[70px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-8 rounded text-xs dark:text-white transition-all">
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
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                Trang {currentPage}/{totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8 rounded border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
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

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl shadow-2xl">
          <DialogHeader className="p-6 bg-[#990033] text-white">
            <div className="flex items-center justify-between">
                <div>
                   <DialogTitle className="text-xl font-black flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl">info</span>
                    Chi Tiết Đơn Hàng #{selectedOrder?._id.slice(-6).toUpperCase()}
                  </DialogTitle>
                  <p className="text-white/70 text-xs mt-1 font-medium italic">Ngày đặt: {selectedOrder && new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</p>
                </div>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Khách hàng</h4>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white leading-tight">{selectedOrder.userId?.username || "Guest"}</span>
                    <span className="text-xs text-slate-500">{selectedOrder.userId?.email || "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-1 text-right md:text-left">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Trạng thái</h4>
                  <div className="flex md:justify-start justify-end">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                      selectedOrder.status === 'Completed' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20' :
                      selectedOrder.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/20' :
                      selectedOrder.status === 'In Progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border border-blue-500/20' :
                      'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Dịch vụ</h4>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedOrder.service?.name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                   {selectedOrder.service?.platform} - {selectedOrder.service?.category}
                  </div>
                </div>
                <div className="space-y-1 text-right md:text-left">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tổng tiền</h4>
                  <div className="font-black text-emerald-600 dark:text-emerald-400 text-xl font-mono">{selectedOrder.totalPrice.toLocaleString()} ₫</div>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                    Link cần chạy
                </h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-sm break-all font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {selectedOrder.link || "Không có link"}
                </div>
              </div>

              {selectedOrder.note && (
                <div className="space-y-3 p-4 bg-amber-50/30 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                  <h4 className="text-xs font-black text-amber-600/70 dark:text-amber-500/70 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">sticky_note_2</span>
                      Ghi chú từ khách
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium">"{selectedOrder.note}"</p>
                </div>
              )}

              {selectedOrder.details && Object.keys(selectedOrder.details).length > 0 && (
                 <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                      Thông tin kỹ thuật
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedOrder.details).map(([key, value]) => (
                      <div key={key} className="flex flex-col p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                          {key === 'username' ? 'Tài khoản' :
                           key === 'password' ? 'Mật khẩu' :
                           key === 'twoFaCode' ? 'Mã 2FA' :
                           key === 'contactInfo' ? 'Liên hệ' :
                           key}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-200 break-all text-sm mt-0.5">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
