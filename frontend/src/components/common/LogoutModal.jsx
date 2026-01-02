export default function LogoutModal({ onConfirm, onCancel, username }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[20px] p-8 w-[400px] flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <div className="w-20 h-20 rounded-full border-4 border-red-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-red-500 font-bold">logout</span>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng xuất</h2>
        <p className="text-slate-600 mb-8 text-center">
          Bạn có chắc chắn muốn đăng xuất {username ? `tài khoản ${username}` : "khỏi HuySadBoiz"}?
        </p>

        <div className="flex gap-3 w-full">
          <button 
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-red-200 cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
