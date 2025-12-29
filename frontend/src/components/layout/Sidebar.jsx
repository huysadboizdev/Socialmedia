import NavItem from "../ui/NavItem"

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-lg">Sub6Sao</div>

      <nav className="px-2 space-y-1">
        <NavItem label="Trang chủ" />
        <NavItem label="Quản lý chung" />
        <NavItem label="Nhiệm vụ hằng ngày" />
        <NavItem label="Điểm danh" />

        <div className="mt-4 text-xs text-gray-400 px-2">Services</div>
        <NavItem label="Facebook" />
        <NavItem label="TikTok" />
        <NavItem label="Instagram" />
        <NavItem label="YouTube" />
      </nav>
    </aside>
  )
}
