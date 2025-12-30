import NavItem from "@/components/ui/NavItem"

export default function Sidebar({ onClose }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 font-bold text-lg flex justify-between">
        Sub6Sao
        {onClose && (
          <button onClick={onClose} className="xl:hidden">✕</button>
        )}
      </div>

      <nav className="px-3 space-y-1 text-sm">
        <NavItem label="Trang chủ" to="/home" />
        <NavItem label="Quản lý chung" />
        <NavItem label="Nhiệm vụ hằng ngày" />
        <NavItem label="Điểm danh" />

        <div className="pt-3 text-xs text-slate-400">Services</div>
        <NavItem label="Facebook" />
        <NavItem label="TikTok" />
        <NavItem label="Instagram" />
        <NavItem label="YouTube" />
      </nav>
    </div>
  )
}
