import AppLayout from "@/components/layout/AppLayout";
import sotienGif from "@/assets/sotien.gif";
import tongnapGif from "@/assets/tongnap.gif";
import napthangGif from "@/assets/napthang.gif";
import capbacGif from "@/assets/capbac.gif";


export default function Home() {
  return (
    <div className="flex-1 min-h-full">
      <div className="w-full p-4 md:p-6 space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>{">"}</span>
          <span>Trang chủ</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="size-20 min-w-[5rem] rounded-full bg-pink-50 flex items-center justify-center">
              <img
                src={sotienGif}
                alt="sotien"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800">0</div>
              <div className="text-sm font-medium text-gray-500">Số dư</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="size-20 min-w-[5rem] rounded-full bg-yellow-50 flex items-center justify-center">
               <img src={tongnapGif} alt="tongnap" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800">0</div>
              <div className="text-sm font-medium text-gray-500">Tổng nạp</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="size-20 min-w-[5rem] rounded-full bg-orange-50 flex items-center justify-center">
               <img src={napthangGif} alt="napthang" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800">0 USD</div>
              <div className="text-sm font-medium text-gray-500">Nạp tháng</div>
            </div>
          </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="size-20 min-w-[5rem] rounded-full bg-red-50 flex items-center justify-center">
               <img src={capbacGif} alt="capbac" className="w-12 h-12 object-contain" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-3xl font-bold text-gray-800">Thành viên</div>
              <div className="text-sm font-medium text-gray-500">Cấp bậc</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - NOTIFICATIONS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Blue Box 1 */}
            <div className="bg-cyan-400 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold mb-3 opacity-90">Admin 2025-12-02 12:28:09</div>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 bg-white rounded-full p-0.5 text-[16px]">touch_app</span>
                  <span>Điểm danh hằng ngày truy cập : <a href="#" className="underline text-purple-700 font-bold">Tại Đây</a></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 bg-white rounded-full p-0.5 text-[16px]">task_alt</span>
                  <span>Nhiệm vụ hằng ngày truy cập: <a href="#" className="underline text-purple-700 font-bold">Tại Đây</a></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600 bg-white rounded-full p-0.5 text-[16px]">emoji_events</span>
                  <span>Đua top nạp ngày truy cập : <a href="#" className="underline text-purple-700 font-bold">Tại Đây</a></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-600 bg-white rounded-full p-0.5 text-[16px]">redeem</span>
                  <span>Tặng bạn 333k truy cập : <a href="#" className="underline text-purple-700 font-bold">Tại Đây</a></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-600 bg-white rounded-full p-0.5 text-[16px]">military_tech</span>
                  <span>Cảm Ơn Bạn Đã Chọn : <span className="text-purple-700 font-bold">Sub6Sao.Com</span></span>
                </div>
              </div>
            </div>

            {/* Blue Box 2 */}
            <div className="bg-cyan-400 rounded-xl p-5 text-white shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs font-semibold mb-3 opacity-90">Admin 2025-12-02 11:31:20</div>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 bg-white rounded-full p-0.5 text-[16px]">support_agent</span>
                  <span>Admin Hỗ Trợ Qua ZaLo : <span className="text-purple-700 font-bold">0383345622</span></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 bg-white rounded-full p-0.5 text-[16px]">campaign</span>
                  <span>Kênh thông báo khuyến mãi : <a href="#" className="underline text-purple-700 font-bold">TẠI ĐÂY</a></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-600 bg-white rounded-full p-0.5 text-[16px]">code</span>
                  <span>Tạo web riêng + tài liệu API : <a href="#" className="underline text-purple-700 font-bold">TẠI ĐÂY</a></span>
                </div>
                 <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-500 bg-white rounded-full p-0.5 text-[16px]">warning</span>
                  <span>FaceBook CSKH Sub6Sao.Com : <a href="#" className="underline text-purple-700 font-bold">TẠI ĐÂY</a></span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - UPDATES */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-fit">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Cập nhật gần đây</h3>
            
            <div className="flex flex-col items-center text-center space-y-4 py-4">
               <img 
                src="https://img.freepik.com/free-vector/teamwork-concept-landing-page_52683-20165.jpg" 
                alt="Welcome" 
                className="w-48 h-auto object-contain"
              />
              
              <div className="space-y-2">
                <h4 className="font-bold text-gray-800">Chào Mừng Bạn Đến Với <span className="text-purple-600">Sub6Sao.Com</span></h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Chúng Tôi Chuyên Cung Cấp - Dịch Vụ Mạng Xã Hội Rẻ Nhất Việt Nam
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Cảm Ơn Các Bạn Đã Đồng Hành Và Sử Dụng Dịch Vụ 🌸
                </p>
              </div>

              <div className="w-full text-left pt-4 mt-2 border-t border-dashed">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  2025-04-15 12:35:11
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

