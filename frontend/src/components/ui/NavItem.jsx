import { NavLink } from "react-router-dom"

export default function NavItem({ label, to = "#", icon, active, isService, hasSubmenu, isOpen, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
          (isActive && to !== "#") || active
            ? "bg-purple-50 text-purple-700 font-semibold shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      <span className="flex-1 text-sm">{label}</span>
      {isService && <span className="material-symbols-outlined text-[16px] text-gray-400">navigate_next</span>}
      {hasSubmenu && <span className={`material-symbols-outlined text-[20px] text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>expand_more</span>}
    </NavLink>
  )
}
