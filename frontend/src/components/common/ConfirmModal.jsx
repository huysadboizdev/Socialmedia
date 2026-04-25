import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xóa", cancelText = "Hủy", confirmColor = "bg-red-600 hover:bg-red-700" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden z-10 transform transition-all border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">
              warning
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {message}
          </p>
        </div>
        
        <div className="flex border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            className="flex-1 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <div className="w-[1px] bg-slate-100 dark:bg-slate-700/50" />
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-bold text-white transition-colors ${confirmColor}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
