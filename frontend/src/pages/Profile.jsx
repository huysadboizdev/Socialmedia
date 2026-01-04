import AppLayout from "@/components/layout/AppLayout";
import SharinganLoader from "@/components/common/SharinganLoader";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [fullName, setFullName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setUserData(res.data.user);
        setFullName(res.data.user.fullName || "");
        setPreviewImage(res.data.user.image || null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const formData = new FormData();
      formData.append("fullName", fullName);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await axios.put(
        `${API_URL}/api/user/profile`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          } 
        }
      );

      if (res.data.success) {
        setUserData(prev => ({ ...prev, ...res.data.user }));
        setPreviewImage(res.data.user.image);
        setSelectedImage(null);
        toast.success("Cập nhật thông tin thành công!");
        // Update local storage if needed
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...res.data.user }));
      } else {
        toast.error(res.data.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

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
          

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 transition-colors duration-300">
            
            {/* LEFT COLUMN - USER INFO */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden h-full transition-colors duration-300">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Tài khoản cá nhân</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Avatar Placeholder */}
                  <div className="flex flex-col items-center gap-4 py-4 border-b border-slate-50 dark:border-slate-800 border-dashed">
                    <div className="relative group">
                      <div className="size-24 rounded-full bg-violet-50 dark:bg-violet-900/20 border-4 border-violet-100/50 dark:border-violet-800 flex items-center justify-center transition-colors overflow-hidden">
                        {previewImage ? (
                          <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-4xl text-violet-600 dark:text-violet-400">person</span>
                        )}
                      </div>
                      <label 
                        htmlFor="avatar-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-white">edit</span>
                      </label>
                      <input 
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800 dark:text-slate-100 text-lg uppercase tracking-wide">{userData?.username || "Loading..."}</div>
                      <div className="text-xs font-semibold px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-full mt-1">THÀNH VIÊN</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">Tên Tài Khoản</label>
                      <div className="w-full font-semibold text-gray-700 dark:text-slate-300">{userData?.username || "..."}</div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">Địa chỉ Email</label>
                      <div className="w-full font-semibold text-gray-700 dark:text-slate-300 break-all">{userData?.email || "..."}</div>
                    </div>

                    {/* Registered At */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">Thời Gian Đăng Kí</label>
                      <div className="w-full font-semibold text-gray-700 dark:text-slate-300">{userData ? new Date(userData.createdAt).toLocaleString('vi-VN') : "..."}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CONFIGURATION */}
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[600px] transition-colors duration-300">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Cấu hình tài khoản</h3>
                </div>

                <div className="p-6 md:p-8">
                  {/* Tabs */}
                  <div className="flex flex-wrap gap-2 mb-10 p-1.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl w-fit transition-all">
                    <button 
                      onClick={() => setActiveTab("info")}
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "info" ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"}`}
                    >
                      Thông tin tài khoản
                    </button>
                    <button 
                      onClick={() => setActiveTab("2fa")}
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "2fa" ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"}`}
                    >
                      Xác thực 2 yếu tố
                    </button>
                    <button 
                      onClick={() => setActiveTab("password")}
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "password" ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40" : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"}`}
                    >
                      Thay đổi mật khẩu
                    </button>
                  </div>

                  {/* Tab Content - Info */}
                  {activeTab === "info" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {/* Grid Data */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        {/* Họ và tên */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Họ và tên:</label>
                          <input 
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Cập nhật họ tên..."
                            className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-gray-700 dark:text-slate-100 font-medium text-sm transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Địa chỉ Email:</label>
                          <div className="w-full px-5 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium text-sm transition-colors">
                            {userData?.email || "..."}
                          </div>
                        </div>

                        {/* Tài khoản */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Tài khoản:</label>
                          <div className="w-full px-5 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium text-sm transition-colors">
                            {userData?.username || "..."}
                          </div>
                        </div>

                        {/* Thời gian đăng kí */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Thời gian đăng kí:</label>
                          <div className="w-full px-5 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium text-sm transition-colors">
                            {userData ? new Date(userData.createdAt).toLocaleString('vi-VN') : "..."}
                          </div>
                        </div>

                        {/* Số dư */}
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Số dư:</label>
                          <div className="w-full px-5 py-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium text-sm transition-colors">
                            {(userData?.balance || 0).toLocaleString('vi-VN')} VNĐ
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handleUpdateProfile}
                          disabled={saving}
                          className="flex items-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[20px]">save</span>
                          {saving ? "Đang lưu..." : "Lưu thông tin"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tab Content - Password Change */}
                  {activeTab === "password" && (
                    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Mật khẩu hiện tại:</label>
                        <input 
                          type="password"
                          placeholder="Nhập mật khẩu hiện tại"
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm dark:text-slate-100 dark:placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Mật khẩu mới:</label>
                        <input 
                          type="password"
                          placeholder="Nhập mật khẩu mới"
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm dark:text-slate-100 dark:placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 dark:text-slate-300">Xác nhận mật khẩu:</label>
                        <input 
                          type="password"
                          placeholder="Xác nhận lại mật khẩu mới"
                          className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-sm dark:text-slate-100 dark:placeholder:text-slate-600"
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button 
                          onClick={handleSavePassword}
                          className="flex items-center gap-2 px-8 py-3.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/40 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "2fa" && (
                    <div className="flex flex-col items-center justify-center h-80 text-center space-y-4 animate-in fade-in duration-500">
                      <div className="size-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-4xl text-orange-400 dark:text-orange-300">shield_lock</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-gray-800 dark:text-slate-100">Xác thực 2 yếu tố (2FA)</div>
                        <div className="text-sm text-gray-400 dark:text-slate-500 max-w-xs mx-auto">Tăng cường bảo mật cho tài khoản của bạn. Tính năng đang được phát triển.</div>
                      </div>
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
