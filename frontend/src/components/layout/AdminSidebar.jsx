import React from 'react';
import NavItem from "@/components/ui/NavItem"
import { useLocation } from "react-router-dom"

export default function AdminSidebar({ onClose, unreadChatCount }) {
  const location = useLocation();

  const handleItemClick = () => {
    if (window.innerWidth < 1280 && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      {/* Logo Header */}
      <div className="px-6 py-5 flex items-center gap-3 shrink-0 bg-white dark:bg-slate-900 z-10">
        <div className="size-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
        </div>
        <div className="flex flex-col">
           <span className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none tracking-tight">
             ADMIN PANEL
           </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto xl:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 pb-6 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-2">Management</div>
        
        <NavItem 
          label="Tổng Quan" 
          to="/admin" 
          icon="dashboard" 
          active={location.pathname === "/admin"} 
          onClick={handleItemClick}
        />

        <NavItem 
          label="Người Dùng" 
          to="/admin/users" 
          icon="group" 
          active={location.pathname === "/admin/users"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Đơn Hàng" 
          to="/admin/orders" 
          icon="shopping_cart" 
          active={location.pathname === "/admin/orders"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Dịch Vụ" 
          to="/admin/services" 
          icon="layers" 
          active={location.pathname === "/admin/services"} 
          onClick={handleItemClick}
        />

         <NavItem 
           label="Mã Giảm Giá" 
           to="/admin/coupons" 
           icon="confirmation_number" 
           active={location.pathname === "/admin/coupons"} 
           onClick={handleItemClick}
         />

        <NavItem 
          label="Nạp Tiền" 
          to="/admin/deposits" 
          icon="account_balance_wallet" 
          active={location.pathname === "/admin/deposits"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Nhiệm Vụ" 
          to="/admin/missions" 
          icon="task_alt" 
          active={location.pathname === "/admin/missions"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Duyệt Nhiệm Vụ" 
          to="/admin/mission-requests" 
          icon="fact_check" 
          active={location.pathname === "/admin/mission-requests"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Duyệt Rút Tiền" 
          to="/admin/withdrawals" 
          icon="currency_exchange" 
          active={location.pathname === "/admin/withdrawals"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Báo Lỗi" 
          to="/admin/reports" 
          icon="flag" 
          active={location.pathname === "/admin/reports"} 
          onClick={handleItemClick}
        />

         <NavItem 
          label="Cài Đặt" 
          to="/admin/settings" 
          icon="settings" 
          active={location.pathname === "/admin/settings"} 
          onClick={handleItemClick}
        />

         <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-4">Communication</div>

         <NavItem 
          label="Chat Hỗ Trợ" 
          to="/admin/chat" 
          icon="chat" 
          active={location.pathname === "/admin/chat"} 
          onClick={handleItemClick}
          badge={unreadChatCount}
        />

        <div className="mt-auto pt-4">
             <NavItem 
                label="Về Trang Chủ" 
                to="/home" 
                icon="home" 
                onClick={handleItemClick}
             />
        </div>
      </nav>
    </div>
  )
}
