import React, { useState } from 'react';

const ConfirmDialog = ({ 
    isOpen, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Xác nhận', 
    cancelText = 'Hủy',
    type = 'info', // 'info', 'danger', 'success'
    showInput = false,
    inputPlaceholder = 'Nhập lý do...',
    confirmLoading = false
}) => {
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>;
            case 'success': return <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>;
            default: return <span className="material-symbols-outlined text-blue-500 text-4xl">info</span>;
        }
    };

    const getColorClass = () => {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
            case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
            default: return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 px-4">
            <div 
                className="bg-white dark:bg-slate-900 rounded-[24px] p-6 w-full max-w-[420px] shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : 
                        type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                        'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                        {getIcon()}
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    {showInput && (
                        <div className="w-full mb-6">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={inputPlaceholder}
                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm min-h-[80px] resize-none text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    )}

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={onCancel}
                            disabled={confirmLoading}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={() => onConfirm(showInput ? inputValue : true)}
                            disabled={confirmLoading}
                            className={`flex-1 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg cursor-pointer text-sm flex items-center justify-center gap-2 ${getColorClass()} ${confirmLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {confirmLoading && (
                                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
