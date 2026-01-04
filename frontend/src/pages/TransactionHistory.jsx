
import React from 'react';

const TransactionHistory = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
       <div className="w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="bg-[#6610f2] p-4 text-white">
            <h2 className="font-bold uppercase text-sm tracking-wide">Lịch sử giao dịch</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold">STT</th>
                  <th className="px-6 py-4 font-bold">Giao dịch</th>
                  <th className="px-6 py-4 font-bold">Thời gian</th>
                  <th className="px-6 py-4 font-bold">Mã giao dịch</th>
                  <th className="px-6 py-4 font-bold">Số tiền</th>
                  <th className="px-6 py-4 font-bold">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">1</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#2cdb9e] text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm shadow-green-500/20">
                      Điểm danh
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                    3 ngày trước
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                    S6S_17672377373433
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="bg-[#6610f2] text-white px-2.5 py-1 rounded text-xs shadow-md shadow-purple-500/20">0</span>
                      <span className="text-slate-400">+</span>
                      <span className="bg-[#ff4747] text-white px-2.5 py-1 rounded text-xs shadow-md shadow-red-500/20">100</span>
                      <span className="text-slate-400">=</span>
                      <span className="bg-[#2cdb9e] text-white px-2.5 py-1 rounded text-xs shadow-md shadow-green-500/20">100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-slate-500 dark:text-slate-400 w-full min-w-[200px] text-xs font-medium">
                      Điểm danh thành công
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
