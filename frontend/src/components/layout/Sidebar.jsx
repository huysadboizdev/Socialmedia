import NavItem from "@/components/ui/NavItem"
import { useState } from "react"
import { useLocation } from "react-router-dom"
import trangchuPng from "@/assets/trangchu.png"
import thongtinPng from "@/assets/thongtin.png"
import naptienPng from "@/assets/naptien.png"
import lichsuGif from "@/assets/lichsugd.gif"
import quanliGif from "@/assets/quanli.gif"
import nhiemvuGif from "@/assets/nhiemvu.gif"
import diemanhGif from "@/assets/điemanh.gif"
import tongnapGif from "@/assets/tongnap.gif"
import capbacGif from "@/assets/capbac.gif"
import fbGif from "@/assets/fb.gif"
import tiktokGif from "@/assets/tiktok.gif"
import igGif from "@/assets/ig.gif"
import allGif from "@/assets/alll_list.gif"
import supportGif from "@/assets/supportusser.gif"
import dieukhoanGif from "@/assets/dieukhoan.gif"
import verifiedGif from "@/assets/vefied.jpg"

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Quản lý chung");
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);
  const [isFacebookExpanded, setIsFacebookExpanded] = useState(false);
  const [isTiktokExpanded, setIsTiktokExpanded] = useState(false);
  const [isInstagramExpanded, setIsInstagramExpanded] = useState(false);
  const [isBlueTickExpanded, setIsBlueTickExpanded] = useState(false);

  const handleItemClick = (label) => {
    setActiveItem(label);
    if (window.innerWidth < 1280 && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {/* Logo Header */}
      <div className="px-6 py-5 flex items-center gap-3 flex-shrink-0 bg-white dark:bg-slate-900 z-10">
        <img src="/icon2.svg" alt="" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display='none'}/>
        <div className="flex flex-col">
           <span className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none tracking-tight flex items-center gap-1">
             HUYTICHXANH
             <span className="material-symbols-outlined text-[16px] text-blue-500">verified</span>
           </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto xl:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 pb-6 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mt-2">Home</div>
        
        <NavItem 
          label="Quản lý chung" 
          icon={quanliGif} 
          active={activeItem === "Quản lý chung" || isGeneralExpanded} 
          hasSubmenu
          isOpen={isGeneralExpanded}
          onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
        />

        {isGeneralExpanded && (
           <div className="ml-[18px] pl-3 space-y-1 border-l border-dashed border-slate-200 dark:border-slate-800 my-1">
             <NavItem label="Trang chủ" to="/home" icon={trangchuPng} active={location.pathname === "/home"} onClick={() => handleItemClick("Trang chủ")} isSubItem />
             <NavItem label="Thông tin cá nhân" to="/profile" icon={thongtinPng} active={location.pathname === "/profile"} onClick={() => handleItemClick("Thông tin cá nhân")} isSubItem />
             <NavItem label="Nạp tiền tài khoản" icon={naptienPng} active={activeItem === "Nạp tiền tài khoản"} onClick={() => handleItemClick("Nạp tiền tài khoản")} isSubItem />
             <NavItem label="Lịch sử giao dịch" to="/history" icon={lichsuGif} active={location.pathname === "/history"} onClick={() => handleItemClick("Lịch sử giao dịch")} isSubItem />
             <NavItem label="Tất cả tiến trình" to="/all-orders" icon={allGif} active={location.pathname === "/all-orders"} onClick={() => handleItemClick("Tất cả tiến trình")} isSubItem />
             <NavItem label="Dịch vụ & cấp bậc" icon={capbacGif} active={activeItem === "Dịch vụ & cấp bậc"} onClick={() => handleItemClick("Dịch vụ & cấp bậc")} isSubItem />
             <NavItem label="Hỗ Trợ Khách Hàng" to="/support" icon={supportGif} active={location.pathname === "/support"} onClick={() => handleItemClick("Hỗ Trợ Khách Hàng")} isSubItem />
             <NavItem label="Điều khoản dịch vụ" to="/terms" icon={dieukhoanGif} active={location.pathname === "/terms"} onClick={() => handleItemClick("Điều khoản dịch vụ")} isSubItem />
           </div>
        )}

        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mt-4">Kiếm Tiền Miễn Phí</div>
        <NavItem label="Nhiệm vụ Hàng Ngày" to="/daily-task" icon={nhiemvuGif} active={location.pathname === "/daily-task"} onClick={() => handleItemClick("Nhiệm vụ Hàng Ngày")} />
        <NavItem label="Điểm Danh Hàng Ngày" to="/attendance" icon={diemanhGif} active={location.pathname === "/attendance"} onClick={() => handleItemClick("Điểm Danh Hàng Ngày")} />
        <NavItem label="Bảng Đua Top Nạp Tiền" icon={tongnapGif} active={activeItem === "Bảng Đua Top Nạp Tiền"} onClick={() => handleItemClick("Bảng Đua Top Nạp Tiền")} />
       

        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mt-4">Services</div>
        <NavItem 
          label="Dịch Vụ Tích Xanh" 
          icon={verifiedGif} 
          active={activeItem === "Dịch Vụ Tích Xanh" || isBlueTickExpanded} 
          hasSubmenu
          isOpen={isBlueTickExpanded}
          onClick={() => setIsBlueTickExpanded(!isBlueTickExpanded)} 
        />
        
        {isBlueTickExpanded && (
           <div className="ml-[18px] pl-3 space-y-1 border-l border-dashed border-slate-200 dark:border-slate-800 my-1">
             <NavItem label="Tích Xanh Facebook" to="/service/facebook-blue" icon={fbGif} active={location.pathname === "/service/facebook-blue"} onClick={() => handleItemClick("Tích Xanh Facebook")} isSubItem />
             <NavItem label="Tích Xanh Instagram" to="/service/instagram-blue" icon={igGif} active={location.pathname === "/service/instagram-blue"} onClick={() => handleItemClick("Tích Xanh Instagram")} isSubItem />
           </div>
        )}
        
        <NavItem 
          label="FaceBook" 
          icon={fbGif} 
          active={activeItem === "FaceBook" || isFacebookExpanded} 
          hasSubmenu
          isOpen={isFacebookExpanded}
          onClick={() => setIsFacebookExpanded(!isFacebookExpanded)} 
        />

        {isFacebookExpanded && (
          <div className="ml-[18px] pl-3 space-y-1 border-l border-dashed border-slate-200 dark:border-slate-800 my-1">
            <NavItem label="Like Bài Viết" to="/service/facebook-like" active={location.pathname === "/service/facebook-like"} onClick={() => handleItemClick("FB_Like Bài Viết")} isSubItem />
            <NavItem label="Tăng Theo Dõi" to="/service/facebook-follow" active={location.pathname === "/service/facebook-follow"} onClick={() => handleItemClick("FB_Tăng Theo Dõi")} isSubItem />
            <NavItem label="Share | Bài Viết" to="/service/facebook-share" active={location.pathname === "/service/facebook-share"} onClick={() => handleItemClick("FB_Share | Bài Viết")} isSubItem />
          </div>
        )}
        <NavItem 
          label="Tik Tok" 
          icon={tiktokGif} 
          active={activeItem === "Tik Tok" || isTiktokExpanded} 
          hasSubmenu
          isOpen={isTiktokExpanded}
          onClick={() => setIsTiktokExpanded(!isTiktokExpanded)} 
        />

        {isTiktokExpanded && (
          <div className="ml-[18px] pl-3 space-y-1 border-l border-dashed border-slate-200 dark:border-slate-800 my-1">
            <NavItem label="Tym video" to="/service/tiktok-like" active={location.pathname === "/service/tiktok-like"} onClick={() => handleItemClick("TT_Tym video")} isSubItem />
            <NavItem label="Tăng theo dõi" to="/service/tiktok-follow" active={location.pathname === "/service/tiktok-follow"} onClick={() => handleItemClick("TT_Tăng theo dõi")} isSubItem />
            <NavItem label="Share video" to="/service/tiktok-share" active={location.pathname === "/service/tiktok-share"} onClick={() => handleItemClick("TT_Share video")} isSubItem />
          </div>
        )}
        <NavItem 
          label="Instagram" 
          icon={igGif} 
          active={activeItem === "Instagram" || isInstagramExpanded} 
          hasSubmenu
          isOpen={isInstagramExpanded}
          onClick={() => setIsInstagramExpanded(!isInstagramExpanded)} 
        />

        {isInstagramExpanded && (
          <div className="ml-[18px] pl-3 space-y-1 border-l border-dashed border-slate-200 dark:border-slate-800 my-1">
            <NavItem label="Like Bài Viết" to="/service/instagram-like" active={location.pathname === "/service/instagram-like"} onClick={() => handleItemClick("IG_Like Bài Viết")} isSubItem />
            <NavItem label="Tăng Theo Dõi" to="/service/instagram-follow" active={location.pathname === "/service/instagram-follow"} onClick={() => handleItemClick("IG_Tăng Theo Dõi")} isSubItem />
            <NavItem label="Share | Bài Viết" to="/service/instagram-share" active={location.pathname === "/service/instagram-share"} onClick={() => handleItemClick("IG_Share | Bài Viết")} isSubItem />
          </div>
        )}
      </nav>
    </div>
  )
}
