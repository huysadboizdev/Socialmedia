import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Dialog state
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        showInput: false,
        onConfirm: () => {},
        confirmLoading: false
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const fetchDeposits = React.useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/admin/deposits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDeposits(res.data.deposits || []);
      }
    } catch (error) {
      console.error("Error fetching deposits:", error);
      toast.error("Không thể tải lịch sử nạp tiền");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Handler for opening approve dialog
  const handleApproveClick = (deposit) => {
    setDialogConfig({
        isOpen: true,
        title: 'Duyệt Nạp Tiền',
        message: `Xác nhận duyệt nạp ${deposit.amount.toLocaleString()}đ cho ${deposit.userId?.username}?`,
        type: 'success',
        confirmText: 'Duyệt Ngay',
        showInput: false,
        onConfirm: () => processApprove(deposit._id)
    });
  };

  const processApprove = async (transactionId) => {
    try {
      setDialogConfig(prev => ({ ...prev, confirmLoading: true }));
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/approve`, { transactionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Đã duyệt thành công");
        setDeposits(deposits.map(d => d._id === transactionId ? { ...d, status: 'approved' } : d));
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        if(isDetailOpen) setIsDetailOpen(false);
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Lỗi khi duyệt");
    } finally {
        setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
    }
  };

  // Handler for opening reject dialog
  const handleRejectClick = (deposit) => {
    setDialogConfig({
        isOpen: true,
        title: 'Từ Chối Nạp Tiền',
        message: 'Bạn có chắc chắn muốn từ chối giao dịch này? Hành động này không thể hoàn tác.',
        type: 'danger',
        confirmText: 'Từ Chối',
        showInput: false, // Usually no need for text input on deposit reject unless standardized
        onConfirm: () => processReject(deposit._id)
    });
  };

  const processReject = async (transactionId) => {
    try {
      setDialogConfig(prev => ({ ...prev, confirmLoading: true }));
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/admin/reject`, { transactionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Đã từ chối giao dịch");
        setDeposits(deposits.map(d => d._id === transactionId ? { ...d, status: 'rejected' } : d));
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        if(isDetailOpen) setIsDetailOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi từ chối");
    } finally {
        setDialogConfig(prev => ({ ...prev, confirmLoading: false }));
    }
  };

  // Filter Logic
  const filteredDeposits = deposits.filter(d => {
    // Filter by Tab
    if (activeTab === 'pending' && d.status !== 'pending') return false;
    if (activeTab === 'history' && d.status === 'pending') return false;

    // Filter by Search
    const matchesSearch = searchTerm === '' || 
      d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.userId?.username && d.userId.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredDeposits.length / pageSize);
  const paginatedDeposits = filteredDeposits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const viewDetail = (deposit) => {
      setSelectedDeposit(deposit);
      setIsDetailOpen(true);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-slate-950 min-h-full transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Quản Lý Nạp Tiền</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Kiểm tra và duyệt các giao dịch nạp tiền</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex p-0.5 bg-slate-200/50 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700 w-fit transition-all">
            <button 
                onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Chờ duyệt ({deposits.filter(d => d.status === 'pending').length})
            </button>
            <button 
                onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-md text-[13px] font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Lịch sử ({deposits.filter(d => d.status !== 'pending').length})
            </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <Input 
            placeholder="Tìm user, mã GD, nội dung..." 
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 rounded-lg dark:text-slate-200 transition-all focus-visible:ring-purple-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={fetchDeposits} variant="outline" className="border-slate-200 ml-auto h-9">
            <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
            Làm mới
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm transition-all">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#990033] hover:bg-[#990033] border-0">
                <TableHead className="text-white font-bold h-11 text-center">Mã GD</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Người Dùng</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Số Tiền</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Nội Dung</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thời Gian</TableHead>
                {activeTab !== 'pending' && <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Trạng Thái</TableHead>}
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex justify-center"><span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">sync</span></div>
                  </TableCell>
                </TableRow>
              ) : paginatedDeposits.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7} className="h-40 text-center text-slate-500 italic">
                       {activeTab === 'pending' ? 'Không có giao dịch chờ duyệt.' : 'Chưa có lịch sử giao dịch.'}
                   </TableCell>
                </TableRow>
              ) : (
                paginatedDeposits.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <TableCell className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">{item._id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.userId?.username || 'Unknown'}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{item.userId?.fullName}</span>
                         </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {item.amount.toLocaleString()} ₫
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-600 dark:text-slate-400 break-all max-w-[200px] mx-auto">
                        {item.description}
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500 dark:text-slate-500">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </TableCell>
                    
                    {activeTab !== 'pending' && (
                        <TableCell className="text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                'bg-yellow-50 text-yellow-600 border-yellow-200'
                            }`}>
                                {item.status === 'approved' ? 'Thành công' : item.status === 'rejected' ? 'Thất bại' : 'Chờ duyệt'}
                            </span>
                        </TableCell>
                    )}

                    <TableCell className="text-center">
                        {activeTab === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                                <Button 
                                    size="sm" 
                                    className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleApproveClick(item)}
                                >
                                    <span className="material-symbols-outlined text-[14px] mr-1">check</span>
                                    Duyệt
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-7 px-2 text-[11px] text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleRejectClick(item)}
                                >
                                    <span className="material-symbols-outlined text-[14px] mr-1">close</span>
                                    Hủy
                                </Button>
                            </div>
                        ) : (
                             <Button variant="ghost" size="sm" onClick={() => viewDetail(item)} className="h-8 w-8 p-0">
                                <span className="material-symbols-outlined text-slate-400 hover:text-blue-500">visibility</span>
                            </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 transition-all">
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-500">Tổng: {filteredDeposits.length}</span>
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
            <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                </Button>
                <span className="h-8 flex items-center px-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded transition-all">
                    {currentPage} / {totalPages || 1}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Button>
            </div>
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl shadow-2xl">
            <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600">receipt_long</span>
                    Chi tiết giao dịch
                </DialogTitle>
            </DialogHeader>
            {selectedDeposit && (
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-slate-500 dark:text-slate-400">Mã giao dịch:</div>
                        <div className="font-mono font-bold text-right text-slate-800 dark:text-slate-200">{selectedDeposit._id}</div>
                        
                        <div className="text-slate-500 dark:text-slate-400">Người dùng:</div>
                        <div className="font-bold text-right text-slate-800 dark:text-slate-200">{selectedDeposit.userId?.username}</div>
                        
                        <div className="text-slate-500 dark:text-slate-400">Số tiền:</div>
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-right text-lg">{selectedDeposit.amount.toLocaleString()} ₫</div>
                        
                        <div className="text-slate-500 dark:text-slate-400">Trạng thái:</div>
                        <div className="text-right">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                selectedDeposit.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20' :
                                selectedDeposit.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'
                            }`}>
                                {selectedDeposit.status === 'approved' ? 'Thành công' : selectedDeposit.status === 'rejected' ? 'Thất bại' : 'Chờ duyệt'}
                            </span>
                        </div>

                        <div className="text-slate-500 dark:text-slate-400">Nội dung:</div>
                        <div className="font-medium text-right break-all text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700 col-span-2 mt-1 italic">
                            {selectedDeposit.description}
                        </div>
                        
                        <div className="text-slate-500 dark:text-slate-400 mt-2">Thời gian:</div>
                        <div className="text-right text-slate-500 mt-2">{new Date(selectedDeposit.createdAt).toLocaleString('vi-VN')}</div>
                    </div>
                </div>
            )}
            <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800">Đóng</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* CONFIRM DIALOG - Now properly integrating the custom component */}
      <ConfirmDialog 
        {...dialogConfig}
        onCancel={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminDeposits;
