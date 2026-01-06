import React from 'react';
import ServiceOrderList from '@/components/common/ServiceOrderList';

const AllOrders = () => {
  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <h1 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight flex items-center gap-2">
            ĐƠN HÀNG ĐÃ MUA
          </h1>
        </div>

        {/* Global Order List Component */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors">
          <ServiceOrderList serviceType="ALL" />
        </div>
      </div>
    </div>
  );
};

export default AllOrders;
