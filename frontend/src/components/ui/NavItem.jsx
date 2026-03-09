import { NavLink } from "react-router-dom"

export default function NavItem({
  label,
  to = "#",
  icon,
  active,
  isService,
  hasSubmenu,
  isOpen,
  onClick,
  isSubItem, // NEW: prop for sub-menu items
  ...props
}) {
  const isImage =
    typeof icon === "string" &&
    (icon.endsWith(".gif") || icon.endsWith(".png") || icon.endsWith(".webp") || icon.endsWith(".jpg"))

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3
        px-3 py-2.5 rounded-xl
        transition-all duration-300
        cursor-pointer select-none
        ${active
          ? "bg-violet-100/80 text-violet-600 font-bold shadow-sm scale-[1.02] -translate-y-px"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }
      `}
    >
      {/* Sub-item Dot Indicator */}
      {isSubItem && (
        <div className={`
          absolute -left-[16px] w-2 h-2 rounded-full border-2 border-white
          transition-all duration-300 z-10
          ${active ? "bg-violet-600 scale-125 shadow-[0_0_8px_rgba(124,58,237,0.5)]" : "bg-slate-200"}
        `} />
      )}

      {/* ICON (material | png | gif) */}
      {icon && (
        <div className={`
          shrink-0 transition-transform duration-300
          ${active ? "scale-110" : "group-hover:scale-110"}
        `}>
          {isImage ? (
            <img
              src={icon}
              alt=""
              className={`
                w-5 h-5 object-contain
                transition-opacity duration-200
                ${active ? "opacity-100 font-bold" : "opacity-80 group-hover:opacity-100"}
              `}
              draggable={false}
            />
          ) : (
            <span
              className={`
                material-symbols-outlined text-[20px] transition-colors
                ${active
                  ? "text-violet-600"
                  : "text-slate-500 group-hover:text-slate-700"
                }
              `}
            >
              {icon}
            </span>
          )}
        </div>
      )}

      {/* LABEL */}
      <span className={`flex-1 text-[13.5px] tracking-wide transition-colors ${active ? "font-bold" : "font-medium"}`}>
        {label}
      </span>

      {/* BADGE */}
      {props.badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {props.badge}
        </span>
      )}

      {/* SERVICE ARROW */}
      {isService && (
        <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-gray-600">
          navigate_next
        </span>
      )}

      {/* SUBMENU ARROW */}
      {hasSubmenu && (
        <span
          className={`
            material-symbols-outlined text-[20px]
            text-gray-400 transition-transform duration-200
            group-hover:text-gray-600
            ${isOpen ? "rotate-180" : ""}
          `}
        >
          expand_more
        </span>
      )}
    </NavLink>
  )
}
