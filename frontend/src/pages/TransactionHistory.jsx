import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTransactions(res.data.transactions);
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
    if (filterType === 'all') return true;
    if (filterType === 'mission_related') return ['mission', 'attendance'].includes(t.type);
    return t.type === filterType;
  });

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

  const getTypeColor = (type) => {
    switch (type) {
      case 'attendance': return 'bg-[#2cdb9e] shadow-green-500/20';
      case 'mission': return 'bg-[#6610f2] shadow-purple-500/20';
      case 'withdraw': return 'bg-[#ff4747] shadow-red-500/20';
      case 'deposit': return 'bg-blue-500 shadow-blue-500/20';
      case 'payment': return 'bg-orange-600 shadow-orange-500/20';
      case 'adjustment': return 'bg-orange-500 shadow-orange-500/20';
      default: return 'bg-slate-500 shadow-slate-500/20';
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
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
       <div className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="bg-[#6610f2] p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="font-bold uppercase text-sm tracking-wide">Lịch sử giao dịch</h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium opacity-80 whitespace-nowrap">Lọc loại:</span>
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white text-xs rounded px-2 py-1 outline-none appearance-none cursor-pointer"
                >
                  <option value="all" className="text-slate-900">Tất cả</option>
                  <option value="mission" className="text-slate-900">Nhiệm vụ</option>
                  <option value="attendance" className="text-slate-900">Báo danh</option>
                  <option value="withdraw" className="text-slate-900">Rút tiền</option>
                  <option value="deposit" className="text-slate-900">Nạp tiền</option>
                  <option value="payment" className="text-slate-900">Thanh toán</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">STT</th>
                  <th className="px-6 py-4 font-bold">Giao dịch</th>
                  <th className="px-6 py-4 font-bold">Thời gian</th>
                  <th className="px-6 py-4 font-bold">Ví xử lý</th>
                  <th className="px-6 py-4 font-bold">Số tiền (Số dư cũ + Giao dịch = Số dư mới)</th>
                  <th className="px-6 py-4 font-bold">Trạng thái</th>
                  <th className="px-6 py-4 font-bold">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">Chưa có giao dịch nào</td>
                  </tr>
                ) : filteredTransactions.map((t, index) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className={`${getTypeColor(t.type)} text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap`}>
                        {getTypeText(t.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                      {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: vi })}
                    </td>
                    <td className="px-6 py-4">
                      {getBalanceTypeBadge(t.balanceType)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="bg-[#6610f2] text-white px-2 py-0.5 rounded text-[11px] min-w-[30px] text-center shadow-md shadow-purple-500/20">
                          {(t.oldBalance || 0).toLocaleString()}
                        </span>
                        <span className="text-slate-400">{t.amount >= 0 ? '+' : ''}</span>
                        <span className={`${t.amount >= 0 ? 'bg-[#ff4747]' : 'bg-red-500'} text-white px-2 py-0.5 rounded text-[11px] min-w-[30px] text-center shadow-md shadow-red-500/20`}>
                          {t.amount.toLocaleString()}
                        </span>
                        <span className="text-slate-400">=</span>
                        <span className="bg-[#2cdb9e] text-white px-2 py-0.5 rounded text-[11px] min-w-[30px] text-center shadow-md shadow-green-500/20">
                          {(t.newBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                        t.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse'
                      }`}>
                        {t.status === 'approved' ? 'Hoàn thành' : t.status === 'rejected' ? 'Bị từ chối' : 'Đang xử lý'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-2 text-slate-500 dark:text-slate-400 w-full min-w-[200px] text-[11px] font-medium leading-relaxed">
                        {t.description || 'Giao dịch thành công'}
                        {t.withdrawalDetails && t.withdrawalDetails.method === 'bank' && (
                            <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] space-y-0.5">
                                <p>🏦 Ngân hàng: <span className="font-bold text-slate-700 dark:text-slate-200">{t.withdrawalDetails.bankName}</span></p>
                                <p>💳 STK: <span className="font-bold text-slate-700 dark:text-slate-200">{t.withdrawalDetails.bankAccount}</span></p>
                                {t.withdrawalDetails.qrCode && (
                                    <a href={t.withdrawalDetails.qrCode} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[12px]">qr_code_2</span>
                                        Xem ảnh QR
                                    </a>
                                )}
                            </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
