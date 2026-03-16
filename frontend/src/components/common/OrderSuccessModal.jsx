import React from 'react';

const OrderSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-2">
             <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Thành công!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium pb-4">
            Bạn đã mua đơn hàng thành công.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#6f42c1] hover:bg-[#5a32a3] text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/30 uppercase tracking-wide"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
