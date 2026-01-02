export default function SuccessModal({ onConfirm, username }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[20px] p-8 w-[400px] flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div className="w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-emerald-500 font-bold">check</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Thành công</h2>
        <p className="text-slate-600 mb-8 text-center">
          Bạn đã đăng nhập {username || "HuySadBoiz"}
        </p>

        <button 
          onClick={onConfirm}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 cursor-pointer"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
