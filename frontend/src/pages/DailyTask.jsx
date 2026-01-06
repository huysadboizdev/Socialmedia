import React, { useState } from 'react';
import { toast } from 'sonner';

const DailyTask = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [withdrawalType, setWithdrawalType] = useState('web');
  const [amount, setAmount] = useState('');

  const stats = [
    {
      label: 'Số Dư',
      value: '0 đ',
      icon: 'database',
      color: 'bg-orange-50',
      iconColor: 'text-orange-500',
      circleColor: 'bg-orange-100'
    },
    {
      label: 'Đã Rút',
      value: '0 đ',
      icon: 'account_balance_wallet',
      color: 'bg-purple-50',
      iconColor: 'text-purple-500',
      circleColor: 'bg-purple-100'
    }
  ];

  const handleWithdrawal = () => {
    if (!amount || parseInt(amount) < 10000) {
      toast.error('Số tiền rút tối thiểu là 10.000 đ');
      return;
    }
    toast.success('Yêu cầu rút tiền đã được gửi!');
    setAmount('');
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 transition-all hover:shadow-md">
            <div className={`size-16 rounded-full ${stat.circleColor} dark:bg-slate-800 flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[32px] ${stat.iconColor}`}>
                {stat.icon}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Task Tabs */}
      <div className="space-y-8">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${
              activeTab === 'list'
                ? 'bg-[#007bff] border-[#007bff] text-white shadow-lg shadow-blue-500/30'
                : 'bg-white border-[#007bff] text-[#007bff] hover:bg-blue-50'
            }`}
          >
            Danh sách nhiệm vụ
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${
              activeTab === 'received'
                ? 'bg-[#007bff] border-[#007bff] text-white shadow-lg shadow-blue-500/30'
                : 'bg-white border-[#007bff] text-[#007bff] hover:bg-blue-50'
            }`}
          >
            Nhiệm vụ đã nhận
          </button>
        </div>

        {/* Empty State */}
        <div className="py-20 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">
            Hiện không có nhiệm vụ nào
          </p>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
        <div className="bg-[#6610f2] p-4 text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">credit_card</span>
          <h3 className="font-bold uppercase tracking-wide">YÊU CẦU RÚT TIỀN</h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Info Alerts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#856404] bg-[#fff3cd] border-l-4 border-[#ffeeba] p-3 rounded font-medium text-sm">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Số tiền có thể rút : từ <span className="font-bold">10,000 đ</span> đến <span className="font-bold">8,888,888 đ</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#856404] font-medium text-sm px-3">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Số dư có thể rút của bạn là : <span className="font-bold">0 đ</span></span>
            </div>
            <div className="flex items-start gap-2 text-red-600 font-bold text-sm px-3">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <div>
                Lưu Ý:<br />
                Rút Về Ngân Hàng Sẽ Mất Phí 20%
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-bold text-sm px-3">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Rút Về Tài Khoản Web Sẽ Không Mất Phí Rút Tiền</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                Hình Thức Rút Tiền
              </label>
              <div className="relative">
                <select
                  value={withdrawalType}
                  onChange={(e) => setWithdrawalType(e.target.value)}
                  className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium appearance-none"
                >
                  <option value="web">Rút về Tài Khoản Web</option>
                  <option value="bank">Rút về Ngân Hàng</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400">expand_more</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                Số Tiền Rút
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3.5 border border-[#6610f2]/30 rounded-xl bg-white dark:bg-slate-800 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                placeholder="Nhập số tiền muốn rút..."
              />
            </div>

            <button
              onClick={handleWithdrawal}
              className="w-full py-4 bg-[#6610f2] hover:bg-[#520dc2] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 uppercase tracking-wide group"
            >
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                send
              </span>
              Rút Tiền Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTask;
