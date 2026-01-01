import NavItem from "@/components/ui/NavItem"
import { useState } from "react"

export default function Sidebar({ onClose }) {
  const [activeItem, setActiveItem] = useState("Quản lý chung");
  const [isGeneralExpanded, setIsGeneralExpanded] = useState(false);

  const handleItemClick = (label) => {
    setActiveItem(label);
    if (window.innerWidth < 1280 && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto custom-scrollbar border-r border-slate-100">
      <div className="p-3 mb-2 flex items-center gap-2 font-bold text-lg text-cyan-500">
        <img src="/icon2.svg" alt="" className="w-7 h-7" onError={(e) => e.target.style.display='none'}/>
        HUYTICHXANH
        <span className="material-symbols-outlined text-[16px] text-blue-500">verified</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto xl:hidden text-gray-500">✕</button>
        )}
      </div>

      <nav className="px-2 space-y-0.5 text-sm font-medium pb-4">
        <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Home</div>
        
        <NavItem 
          label="Quản lý chung" 
          icon="grid_view" 
          active={activeItem === "Quản lý chung" || isGeneralExpanded} 
          hasSubmenu
          isOpen={isGeneralExpanded}
          onClick={() => setIsGeneralExpanded(!isGeneralExpanded)}
        />

        {isGeneralExpanded && (
           <div className="ml-5 pl-2 space-y-1 border-l border-dashed border-slate-200 my-1">
             <NavItem label="Trang chủ" icon="home" active={activeItem === "Trang chủ"} onClick={() => handleItemClick("Trang chủ")} />
             <NavItem label="Thông tin cá nhân" icon="person" active={activeItem === "Thông tin cá nhân"} onClick={() => handleItemClick("Thông tin cá nhân")} />
             <NavItem label="Nạp tiền tài khoản" icon="account_balance_wallet" active={activeItem === "Nạp tiền tài khoản"} onClick={() => handleItemClick("Nạp tiền tài khoản")} />
             <NavItem label="Lịch sử giao dịch" icon="history" active={activeItem === "Lịch sử giao dịch"} onClick={() => handleItemClick("Lịch sử giao dịch")} />
             <NavItem label="Tất cả tiến trình" icon="list_alt" active={activeItem === "Tất cả tiến trình"} onClick={() => handleItemClick("Tất cả tiến trình")} />
             <NavItem label="Dịch vụ & cấp bậc" icon="military_tech" active={activeItem === "Dịch vụ & cấp bậc"} onClick={() => handleItemClick("Dịch vụ & cấp bậc")} />
             <NavItem label="Hỗ Trợ Khách Hàng" icon="support_agent" active={activeItem === "Hỗ Trợ Khách Hàng"} onClick={() => handleItemClick("Hỗ Trợ Khách Hàng")} />
             <NavItem label="Điều khoản dịch vụ" icon="gavel" active={activeItem === "Điều khoản dịch vụ"} onClick={() => handleItemClick("Điều khoản dịch vụ")} />
           </div>
        )}

        <div className="pt-4 px-3 py-2 text-xs text-gray-500 font-normal">Kiếm Tiền Miễn Phí</div>
        <NavItem label="Nhiệm vụ Hàng Ngày" icon="target" active={activeItem === "Nhiệm vụ Hàng Ngày"} onClick={() => handleItemClick("Nhiệm vụ Hàng Ngày")} />
        <NavItem label="Điểm Danh Hàng Ngày" icon="calendar_today" active={activeItem === "Điểm Danh Hàng Ngày"} onClick={() => handleItemClick("Điểm Danh Hàng Ngày")} />
        <NavItem label="Bảng Đua Top Nạp Tiền" icon="leaderboard" active={activeItem === "Bảng Đua Top Nạp Tiền"} onClick={() => handleItemClick("Bảng Đua Top Nạp Tiền")} />
        <NavItem label="Giới thiệu nhận tiền" icon="person_add" active={activeItem === "Giới thiệu nhận tiền"} onClick={() => handleItemClick("Giới thiệu nhận tiền")} />

        <div className="pt-4 px-3 py-2 text-xs text-gray-500 font-normal">Services</div>
        <NavItem label="Dịch Vụ Miễn Phí" icon="stars" isService active={activeItem === "Dịch Vụ Miễn Phí"} onClick={() => handleItemClick("Dịch Vụ Miễn Phí")} />
        <NavItem label="FaceBook" icon="facebook" isService active={activeItem === "FaceBook"} onClick={() => handleItemClick("FaceBook")} />
        <NavItem label="Tik Tok" icon="music_note" isService active={activeItem === "Tik Tok"} onClick={() => handleItemClick("Tik Tok")} />
        <NavItem label="Instagram" icon="photo_camera" isService active={activeItem === "Instagram"} onClick={() => handleItemClick("Instagram")} />
        <NavItem label="Telegram" icon="send" isService active={activeItem === "Telegram"} onClick={() => handleItemClick("Telegram")} />
        <NavItem label="YouTube" icon="play_circle" isService active={activeItem === "YouTube"} onClick={() => handleItemClick("YouTube")} />
        <NavItem label="Shoppe" icon="shopping_bag" isService active={activeItem === "Shoppe"} onClick={() => handleItemClick("Shoppe")} />
        <NavItem label="X - Twitter" icon="close" isService active={activeItem === "X - Twitter"} onClick={() => handleItemClick("X - Twitter")} />
        <NavItem label="Threads" icon="alternate_email" isService active={activeItem === "Threads"} onClick={() => handleItemClick("Threads")} />
      </nav>
    </div>
  )
}
