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

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Quản lý chung");
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);

  const handleItemClick = (label) => {
    setActiveItem(label);
    if (window.innerWidth < 1280 && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-100 overflow-hidden">
      {/* Logo Header */}
      <div className="px-6 py-5 flex items-center gap-3 flex-shrink-0 bg-white z-10">
        <img src="/icon2.svg" alt="" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display='none'}/>
        <div className="flex flex-col">
           <span className="font-bold text-lg text-slate-800 leading-none tracking-tight flex items-center gap-1">
             HUYTICHXANH
             <span className="material-symbols-outlined text-[16px] text-blue-500">verified</span>
           </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto xl:hidden p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 pb-6 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-2">Home</div>
        
        <NavItem 
          label="Quản lý chung" 
          icon={quanliGif} 
          active={activeItem === "Quản lý chung" || isGeneralExpanded} 
          hasSubmenu
          isOpen={isGeneralExpanded}
          onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
        />

        {isGeneralExpanded && (
           <div className="ml-[18px] pl-3 space-y-1 border-l border-dashed border-slate-200 my-1">
             <NavItem label="Trang chủ" to="/home" icon={trangchuPng} active={location.pathname === "/home"} onClick={() => handleItemClick("Trang chủ")} isSubItem />
             <NavItem label="Thông tin cá nhân" to="/profile" icon={thongtinPng} active={location.pathname === "/profile"} onClick={() => handleItemClick("Thông tin cá nhân")} isSubItem />
             <NavItem label="Nạp tiền tài khoản" icon={naptienPng} active={activeItem === "Nạp tiền tài khoản"} onClick={() => handleItemClick("Nạp tiền tài khoản")} isSubItem />
             <NavItem label="Lịch sử giao dịch" icon={lichsuGif} active={activeItem === "Lịch sử giao dịch"} onClick={() => handleItemClick("Lịch sử giao dịch")} isSubItem />
             <NavItem label="Tất cả tiến trình" icon={allGif} active={activeItem === "Tất cả tiến trình"} onClick={() => handleItemClick("Tất cả tiến trình")} isSubItem />
             <NavItem label="Dịch vụ & cấp bậc" icon={capbacGif} active={activeItem === "Dịch vụ & cấp bậc"} onClick={() => handleItemClick("Dịch vụ & cấp bậc")} isSubItem />
             <NavItem label="Hỗ Trợ Khách Hàng" icon={supportGif} active={activeItem === "Hỗ Trợ Khách Hàng"} onClick={() => handleItemClick("Hỗ Trợ Khách Hàng")} isSubItem />
             <NavItem label="Điều khoản dịch vụ" icon={dieukhoanGif} active={activeItem === "Điều khoản dịch vụ"} onClick={() => handleItemClick("Điều khoản dịch vụ")} isSubItem />
           </div>
        )}

        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-4">Kiếm Tiền Miễn Phí</div>
        <NavItem label="Nhiệm vụ Hàng Ngày" icon={nhiemvuGif} active={activeItem === "Nhiệm vụ Hàng Ngày"} onClick={() => handleItemClick("Nhiệm vụ Hàng Ngày")} />
        <NavItem label="Điểm Danh Hàng Ngày" icon={diemanhGif} active={activeItem === "Điểm Danh Hàng Ngày"} onClick={() => handleItemClick("Điểm Danh Hàng Ngày")} />
        <NavItem label="Bảng Đua Top Nạp Tiền" icon={tongnapGif} active={activeItem === "Bảng Đua Top Nạp Tiền"} onClick={() => handleItemClick("Bảng Đua Top Nạp Tiền")} />
       

        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-4">Services</div>
        <NavItem label="Dịch Vụ Tích Xanh" icon="stars" isService active={activeItem === "Dịch Vụ Tích Xanh"} onClick={() => handleItemClick("Dịch Vụ Tích Xanh")} />
        <NavItem label="FaceBook" icon={fbGif} isService active={activeItem === "FaceBook"} onClick={() => handleItemClick("FaceBook")} />
        <NavItem label="Tik Tok" icon={tiktokGif} isService active={activeItem === "Tik Tok"} onClick={() => handleItemClick("Tik Tok")} />
        <NavItem label="Instagram" icon={igGif} isService active={activeItem === "Instagram"} onClick={() => handleItemClick("Instagram")} />
      </nav>
    </div>
  )
}
