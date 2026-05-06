import AppLayout from "@/components/layout/AppLayout";
import NotificationModal from "@/components/common/NotificationModal";
import sotienGif from "@/assets/sotien.gif";
import tongnapGif from "@/assets/tongnap.gif";
import napthangGif from "@/assets/napthang.gif";
import capbacGif from "@/assets/capbac.gif";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };

    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const res = await axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setUserData(res.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex-1 min-h-full">
      <div className="w-full p-4 md:p-6 space-y-6">
        <NotificationModal />
        
        {userData?.isWeeklyTop && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">emoji_events</span>
              <div>
                <h3 className="font-bold text-lg">Chúc mừng bạn!</h3>
                <p className="text-sm font-medium">Bạn đang là <span className="font-bold underline">Người đứng nhất tuần</span> nạp tiền. Bạn sẽ được giảm thêm <span className="font-bold text-yellow-100 text-lg">20%</span> cho mọi dịch vụ!</p>
              </div>
            </div>
            <img src={sotienGif} alt="reward" className="w-12 h-12 hidden md:block opacity-80" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors">
            <div className="size-20 min-w-20 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
              <img
                src={sotienGif}
                alt="sotien"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                {(userData?.balance || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Số dư</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors">
            <div className="size-20 min-w-20 rounded-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
               <img src={tongnapGif} alt="tongnap" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                {(userData?.totalDeposit || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Tổng nạp</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors">
            <div className="size-20 min-w-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
               <img src={napthangGif} alt="napthang" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800 dark:text-slate-100">
                {(userData?.monthlyDeposit || 0).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Nạp tháng</div>
            </div>
          </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 transition-colors">
            <div className="size-20 min-w-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
               <img src={capbacGif} alt="capbac" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800 dark:text-slate-100">{userData?.rankName || 'Thành viên'}</div>
              <div className="text-sm font-medium text-gray-500 dark:text-slate-400">Cấp bậc</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - NOTIFICATIONS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Blue Box 1 */}
            <div className="bg-cyan-400 dark:bg-cyan-900/40 rounded-xl p-5 text-white dark:text-cyan-100 shadow-sm hover:shadow-md transition-all border border-transparent dark:border-cyan-800/50">
              <div className="text-xs font-semibold mb-3 opacity-90 dark:text-cyan-400">Admin {currentTime}</div>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 rounded-full p-0.5 text-[16px]">touch_app</span>
                  <span>Điểm danh hằng ngày truy cập : <Link to="/attendance" className="underline text-purple-700 dark:text-purple-400 font-bold">Tại Đây</Link></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 bg-white dark:bg-slate-800 rounded-full p-0.5 text-[16px]">task_alt</span>
                  <span>Nhiệm vụ hằng ngày truy cập: <Link to="/daily-task" className="underline text-purple-700 dark:text-purple-400 font-bold">Tại Đây</Link></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 bg-white dark:bg-slate-800 rounded-full p-0.5 text-[16px]">military_tech</span>
                  <span>Cảm Ơn Bạn Đã Chọn : <span className="text-purple-700 dark:text-purple-300 font-bold">HUYTICHXANH</span></span>
                </div>
              </div>
            </div>

            {/* Blue Box 2 */}
            <div className="bg-cyan-400 dark:bg-cyan-900/40 rounded-xl p-5 text-white dark:text-cyan-100 shadow-sm hover:shadow-md transition-all border border-transparent dark:border-cyan-800/50">
              <div className="text-xs font-semibold mb-3 opacity-90 dark:text-cyan-400">Admin {currentTime}</div>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-full p-0.5 text-[16px]">support_agent</span>
                  <span>Admin Hỗ Trợ Qua ZaLo : <span className="text-purple-700 dark:text-purple-300 font-bold">0763076124</span></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500 dark:text-orange-400 bg-white dark:bg-slate-800 rounded-full p-0.5 text-[16px]">warning</span>
                  <span>FaceBook CSKH HUYTICHXANH.Com : <a href="https://www.facebook.com/huy.haquang.39395/" target="_blank" rel="noopener noreferrer" className="underline text-purple-700 dark:text-purple-400 font-bold">TẠI ĐÂY</a></span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - UPDATES */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 h-fit transition-colors">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4 border-b dark:border-slate-800 pb-2">Cập nhật gần đây</h3>
            
            <div className="flex flex-col items-center text-center space-y-4 py-4">
               <img 
                src="https://img.freepik.com/free-vector/teamwork-concept-landing-page_52683-20165.jpg" 
                alt="Welcome" 
                className="w-48 h-auto object-contain dark:opacity-80 dark:grayscale-[0.2]"
              />
              
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800 dark:text-slate-200">Chào Mừng Bạn Đến Với <span className="text-purple-600 dark:text-purple-400">HUYTICHXANH</span></h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Chúng Tôi Chuyên Cung Cấp - Dịch Vụ Mạng Xã Hội Rẻ Nhất Việt Nam
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  Cảm Ơn Các Bạn Đã Đồng Hành Và Sử Dụng Dịch Vụ 🌸
                </p>
              </div>

              <div className="w-full text-left pt-4 mt-2 border-t border-dashed dark:border-slate-800">
                <div className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {currentTime}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

