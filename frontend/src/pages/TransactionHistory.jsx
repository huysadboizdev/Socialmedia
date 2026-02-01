import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || 
                       (filterType === 'mission_related' ? ['mission', 'attendance'].includes(t.type) : t.type === filterType);
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedData = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getTypeText = (type) => {
    switch (type) {
      case 'attendance': return 'Báo danh';
      case 'mission': return 'Nhiệm vụ';
      case 'withdraw': return 'Rút tiền';
      case 'deposit': return 'Nạp tiền';
      case 'payment': return 'Thanh toán';
      case 'adjustment': return 'Điều chỉnh';
      default: return type;
    }
  };

  const getBalanceTypeBadge = (balanceType) => {
    if (balanceType === 'mission') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 uppercase tracking-tighter">
          <span className="material-symbols-outlined text-[12px]">payments</span>
          Ví Nhiệm vụ
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase tracking-tighter">
        <span className="material-symbols-outlined text-[12px]">account_balance_wallet</span>
        Ví Profile
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[#f8f9fa] dark:bg-slate-950 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Lịch sử giao dịch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Xem lại các hoạt động nạp, rút và biến động số dư của bạn</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <Input 
            placeholder="Tìm kiếm nội dung giao dịch..." 
            className="pl-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <Select value={filterType} onValueChange={(v) => { setFilterType(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 dark:bg-slate-800 h-9 text-sm">
            <SelectValue placeholder="Loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="mission">Nhiệm vụ</SelectItem>
            <SelectItem value="attendance">Báo danh</SelectItem>
            <SelectItem value="withdraw">Rút tiền</SelectItem>
            <SelectItem value="deposit">Nạp tiền</SelectItem>
            <SelectItem value="payment">Thanh toán</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#990033] hover:bg-[#990033] border-0">
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">STT</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Giao dịch</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Thời gian</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Ví xử lý</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Biến động số dư</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20">Trạng thái</TableHead>
                <TableHead className="text-white font-bold h-11 text-center border-l border-white/20 w-[300px]">Nội dung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex justify-center">
                      <span className="material-symbols-outlined animate-spin text-slate-400 text-4xl">sync</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center text-slate-500 italic font-medium">
                    Chưa có giao dịch nào được ghi lại
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((t, index) => (
                  <TableRow key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <td className="text-center font-bold text-slate-400 text-xs">{(currentPage-1)*pageSize + index + 1}</td>
                    <TableCell className="text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight text-white ${
                        t.type === 'withdraw' ? 'bg-rose-500' : 
                        t.type === 'deposit' ? 'bg-blue-500' : 
                        t.type === 'mission' ? 'bg-purple-600' : 
                        t.type === 'attendance' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}>
                        {getTypeText(t.type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-[11px] text-slate-500 font-medium">
                      {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: vi })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {getBalanceTypeBadge(t.balanceType)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <span className="text-slate-400">{(t.oldBalance || 0).toLocaleString()}</span>
                          <span className={`${t.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[12px] font-black text-slate-800 shadow-sm border border-slate-200">
                          {(t.newBalance || 0).toLocaleString()} ₫
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        t.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                        t.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-yellow-50 text-yellow-600 border-yellow-200'
                      }`}>
                        {t.status === 'approved' ? 'Hoàn thành' : t.status === 'rejected' ? 'Bị từ chối' : 'Đang xử lý'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-2 text-slate-500 dark:text-slate-400 text-[11px] font-medium leading-relaxed max-w-[280px] mx-auto">
                        {t.description || 'Giao dịch thành công'}
                        {t.withdrawalDetails && t.withdrawalDetails.method === 'bank' && (
                            <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] space-y-0.5">
                                <p>🏦 <span className="font-bold text-slate-700 dark:text-slate-200">{t.withdrawalDetails.bankName}</span></p>
                                <p>💳 <span className="font-bold text-slate-700 dark:text-slate-200">{t.withdrawalDetails.bankAccount}</span></p>
                            </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
          <div className="text-sm text-slate-500">
            Hiển thị {paginatedData.length} giao dịch mỗi trang.
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Tổng: {filteredTransactions.length}</span>
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

export default TransactionHistory;
