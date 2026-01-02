import AppLayout from "@/components/layout/AppLayout";
import SharinganLoader from "@/components/common/SharinganLoader";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("password");
  const [saving, setSaving] = useState(false);

  const handleSavePassword = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Thay đổi mật khẩu thành công!");
    }, 2000);
  };

  return (
    <>
      {saving && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <SharinganLoader size={140} />
        </div>
      )}
      <div className="flex-1 min-h-full">
        <div className="w-full p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>{">"}</span>
            <span>Thông Tin Cá Nhân</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN - USER INFO */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tài khoản cá nhân</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700">Tên Tài Khoản</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-gray-500 text-sm">
                      huydzv1
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700">Địa chỉ Email</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-gray-500 text-sm">
                      hoicaiditmemay6@gmail.com
                    </div>
                  </div>

                  {/* Registered At */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700">Thời Gian Đăng Kí</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-gray-500 text-sm">
                      2025-12-28 16:41:03
                    </div>
                  </div>

                  {/* Last Login */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700">Đăng Nhập Gần Đây</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-gray-500 text-sm">
                      6 giờ trước
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CONFIGURATION */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 min-h-[500px]">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Cấu hình tài khoản</h3>
                </div>

                <div className="p-6">
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    <button 
                      onClick={() => setActiveTab("info")}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "info" ? "text-violet-600" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      Thông tin tài khoản
                    </button>
                    <button 
                      onClick={() => setActiveTab("2fa")}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "2fa" ? "text-violet-600" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      Xác thực 2 yếu tố
                    </button>
                    <button 
                      onClick={() => setActiveTab("password")}
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "password" ? "bg-violet-600 text-white shadow-lg shadow-violet-200" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      Thay đổi mật khẩu
                    </button>
                  </div>

                  {/* Tab Content - Password Change */}
                  {activeTab === "password" && (
                    <div className="space-y-6 max-w-4xl">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700">Mật khẩu hiện tại:</label>
                        <input 
                          type="password"
                          placeholder="Nhập mật khẩu hiện tại"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700">Mật khẩu mới:</label>
                        <input 
                          type="password"
                          placeholder="Nhập mật khẩu mới"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700">Xác nhận mật khẩu:</label>
                        <input 
                          type="password"
                          placeholder="Xác nhận lại mật khẩu mới"
                          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 outline-none transition-all text-sm"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handleSavePassword}
                          className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                        >
                          <span className="material-symbols-outlined text-[20px]">lock</span>
                          Thay đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "info" && (
                    <div className="flex items-center justify-center h-64 text-gray-400 font-medium italic">
                      Tính năng đang cập nhật...
                    </div>
                  )}

                  {activeTab === "2fa" && (
                    <div className="flex items-center justify-center h-64 text-gray-400 font-medium italic">
                      Tính năng đang cập nhật...
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
