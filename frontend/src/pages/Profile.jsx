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

  // 2FA States
  const [twoFactorMethod, setTwoFactorMethod] = useState("none");
  const [qrCodeData, setQrCodeData] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isPendingEmail, setIsPendingEmail] = useState(false);
  const [tempSecret, setTempSecret] = useState("");

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
        setTwoFactorMethod(res.data.user.is2FAEnabled ? res.data.user.twoFactorMethod : "none");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  const handleGenerate2FA = async (method) => {
      try {
          setSaving(true);
          const token = localStorage.getItem("token");
          const res = await axios.post(`${API_URL}/api/user/2fa/generate`, { method }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
              if (method === 'authenticator') {
                  setQrCodeData(res.data.qrCodeUrl);
                  setTempSecret(res.data.secret);
              } else {
                  setIsPendingEmail(true);
                  toast.success(res.data.message);
              }
              setTwoFactorMethod(method);
          } else {
              toast.error(res.data.message || "Lỗi tạo 2FA");
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Lỗi tạo 2FA");
      } finally {
          setSaving(false);
      }
  };

  const handleVerifySetup2FA = async () => {
      if (!verifyCode) return toast.error("Vui lòng nhập mã xác nhận");
      try {
          setSaving(true);
          const token = localStorage.getItem("token");
          const res = await axios.post(`${API_URL}/api/user/2fa/verify-setup`, { 
              method: twoFactorMethod,
              code: verifyCode
           }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
              toast.success(res.data.message);
              setUserData({ ...userData, is2FAEnabled: true, twoFactorMethod });
              setQrCodeData("");
              setTempSecret("");
              setIsPendingEmail(false);
              setVerifyCode("");
          } else {
              toast.error(res.data.message || "Mã không hợp lệ");
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Mã không hợp lệ");
      } finally {
          setSaving(false);
      }
  };

  const handleDisable2FA = async () => {
      // Đầu tiên gọi API không truyền code để bắt đầu flow (để lấy email otp nếu method=email)
      try {
          setSaving(true);
          const token = localStorage.getItem("token");
          const res = await axios.post(`${API_URL}/api/user/2fa/disable`, { code: verifyCode }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
              if (res.data.pendingEmail) {
                  setIsPendingEmail(true);
                  toast.success(res.data.message);
              } else {
                  toast.success(res.data.message);
                  setUserData({ ...userData, is2FAEnabled: false, twoFactorMethod: 'none' });
                  setTwoFactorMethod("none");
                  setIsPendingEmail(false);
                  setVerifyCode("");
              }
          } else {
              toast.error(res.data.message || "Lỗi huỷ 2FA");
          }
      } catch (error) {
          toast.error(error.response?.data?.message || "Lỗi huỷ 2FA");
      } finally {
          setSaving(false);
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
            Authorization: `Bearer ${token}`
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
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                        title="Thay đổi ảnh đại diện"
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
                    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl px-2">
                       {/* HEADER */}
                       <div className="flex flex-col mb-8">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-3xl text-violet-600 dark:text-violet-400">gpp_shield</span>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Xác thực 2 bước (2FA)</h2>
                         </div>
                         <p className="text-sm text-gray-500 dark:text-slate-400">Bảo vệ tài khoản của bạn khỏi rủi ro bị đánh cắp bằng mã xác minh trước mỗi lần rút tiền hoặc đặt dịch vụ mới.</p>
                       </div>

                       {userData?.is2FAEnabled ? (
                          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6">
                              <div className="flex items-center gap-4 mb-4">
                                   <div className="size-12 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center">
                                       <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
                                   </div>
                                   <div>
                                       <h3 className="font-bold text-gray-800 dark:text-slate-200">Đã bật bảo mật 2 lớp</h3>
                                       <p className="text-sm text-gray-600 dark:text-slate-400">Phương thức: <span className="font-semibold uppercase">{userData.twoFactorMethod}</span></p>
                                   </div>
                              </div>
                              <div className="mt-6 border-t border-emerald-200/50 dark:border-slate-700 pt-6">
                                   <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Để tắt tính năng này, bạn cần nhập mã xác nhận hiện tại.</p>
                                   
                                   {isPendingEmail && userData.twoFactorMethod === 'email' && (
                                       <div className="mb-4 text-sm text-orange-600 font-medium">Mã uỷ quyền tắt 2FA đã được gửi về email của bạn!</div>
                                   )}
                                   
                                   <div className="flex items-center gap-3 max-w-sm">
                                         <input 
                                             type="text" 
                                             placeholder="Nhập mã xác nhận..." 
                                             value={verifyCode}
                                             onChange={(e) => setVerifyCode(e.target.value)}
                                             className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 font-medium"
                                         />
                                         <button 
                                             onClick={handleDisable2FA}
                                             disabled={saving}
                                             className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                         >Tắt 2FA</button>
                                   </div>
                              </div>
                          </div>
                       ) : (
                          <div className="space-y-6">
                             {!qrCodeData && !isPendingEmail ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {/* EMAIL PROVIDER OPTION */}
                                     <div className="border-2 border-slate-100 dark:border-slate-800 p-5 rounded-2xl hover:border-violet-300 dark:hover:border-violet-700 transition cursor-pointer" onClick={() => handleGenerate2FA('email')}>
                                         <div className="flex justify-between items-start mb-4">
                                             <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined">mail</span>
                                             </div>
                                         </div>
                                         <h4 className="font-bold text-gray-800 dark:text-slate-200 text-base mb-1">Qua Email</h4>
                                         <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">Nhận mã xác nhận qua địa chỉ email liên kết tài khoản.</p>
                                         <button className="mt-4 text-violet-600 dark:text-violet-400 text-sm font-bold">Cài đặt ngay &rarr;</button>
                                     </div>

                                     {/* APP PROVIDER OPTION */}
                                     <div className="border-2 border-slate-100 dark:border-slate-800 p-5 rounded-2xl hover:border-orange-300 dark:hover:border-orange-700 transition cursor-pointer" onClick={() => handleGenerate2FA('authenticator')}>
                                         <div className="flex justify-between items-start mb-4">
                                             <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined">qr_code_scanner</span>
                                             </div>
                                         </div>
                                         <h4 className="font-bold text-gray-800 dark:text-slate-200 text-base mb-1">Google / Authy App</h4>
                                         <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">Sử dụng ứng dụng Authenticator để lấy mã nhanh chóng, tiện lợi.</p>
                                         <button className="mt-4 text-violet-600 dark:text-violet-400 text-sm font-bold">Cài đặt ngay &rarr;</button>
                                     </div>
                                </div>
                             ) : (
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                                     <div className="flex relative justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                                          <div className="font-bold text-lg text-gray-800 dark:text-slate-200">
                                              {twoFactorMethod === 'email' ? 'Xác minh Email' : 'Quét Mã Trình Xác Thực'}
                                          </div>
                                          <button onClick={() => { setQrCodeData(''); setIsPendingEmail(false); setTwoFactorMethod('none'); setVerifyCode(''); }} className="text-gray-400 hover:text-gray-800 dark:hover:text-slate-100 transition px-2">Hủy</button>
                                     </div>

                                     <div className="flex flex-col items-center">
                                         {qrCodeData && (
                                            <>
                                              <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 text-center">Sử dụng ứng dụng Google Authenticator hoặc Authy quét mã QR bên dưới.</p>
                                              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
                                                  <img src={qrCodeData} alt="QR Code" className="w-48 h-48" />
                                              </div>
                                              <div className="text-xs text-gray-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded max-w-full truncate selec-all">Key: {tempSecret}</div>
                                            </>
                                         )}

                                         {isPendingEmail && (
                                              <div className="text-center w-full my-6">
                                                   <div className="mx-auto size-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 my-auto flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                                                   </div>
                                                   <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Chúng tôi đã gửi 1 mã 6 chữ số tới <span className="font-bold">{userData?.email}</span></p>
                                                   <p className="text-xs text-gray-500 mt-1">Mã có hiệu lực trong vòng 10 phút. Vui lòng kiểm tra hộp thư.</p>
                                              </div>
                                         )}

                                         <div className="w-full max-w-sm mt-8 space-y-4">
                                            <input 
                                                className="w-full text-center tracking-[0.5em] font-bold text-xl py-4 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-violet-500 outline-none text-slate-800 dark:text-slate-100 uppercase"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={verifyCode}
                                                onChange={(e) => setVerifyCode(e.target.value)}
                                            />
                                            <button 
                                                className="w-full py-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-[15px] hover:opacity-90 transition disabled:opacity-50"
                                                onClick={handleVerifySetup2FA}
                                                disabled={saving || !verifyCode}
                                            >
                                                Kích hoạt 2FA
                                            </button>
                                         </div>
                                     </div>
                                </div>
                             )}
                          </div>
                       )}
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
