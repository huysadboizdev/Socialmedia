import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import LogoutModal from "../common/LogoutModal"
import { useNavigate, useLocation } from "react-router-dom"

export default function Header({ onMenu }) {
  const [showLogout, setShowLogout] = useState(false)
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
           (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  })

  // Initialize theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem("theme", newDark ? "dark" : "light")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setShowLogout(false)
    navigate("/login")
  }

  const location = useLocation()

  const routeMap = {
    "/home": "Trang Chủ",
    "/profile": "Thông Tin Cá Nhân",
    "/attendance": "Điểm Danh Hàng Ngày",
    "/daily-task": "Nhiệm vụ Hàng Ngày",
    "/deposit": "Nạp Tiền Giao Dịch",
    "/history": "Lịch Sử Giao Dịch",
    "/all-orders": "Tất cả tiến trình",
    "/service/facebook-like": "Like Bài Viết",
    "/service/facebook-follow": "Tăng Theo Dõi",
    "/service/facebook-share": "Share | Bài Viết",
    "/service/tiktok-like": "Tym video",
    "/service/tiktok-follow": "Tăng theo dõi",
    "/service/tiktok-share": "Share video",
    "/service/instagram-follow": "Tăng Theo Dõi",
    "/service/instagram-like": "Like Bài Viết",
    "/service/instagram-share": "Share | Bài Viết",
    "/service/facebook-blue": "Tích Xanh Facebook",
    "/service/instagram-blue": "Tích Xanh Instagram",
    "/support": "Hỗ Trợ Khách Hàng",
    "/terms": "Điều khoản dịch vụ",
    "/admin": "Quản Trị Hệ Thống",
    "/admin/users": "Quản Lý Người Dùng",
    "/admin/services": "Quản Lý Dịch Vụ",
    "/admin/orders": "Quản Lý Đơn Hàng",
    "/admin/missions": "Quản Lý Nhiệm Vụ",
    "/admin/mission-requests": "Duyệt Nhiệm Vụ",
    "/admin/withdrawals": "Duyệt Rút Tiền",
    "/admin/settings": "Cài Đặt Hệ Thống",
  }

  const currentPage = routeMap[location.pathname] || ""

  const handleShowLogout = () => {
      try {
          const userStr = localStorage.getItem("user")
          if (userStr) {
              const user = JSON.parse(userStr)
              setUsername(user.username || user.name || "")
          }
      } catch (e) {
          console.error("Error parsing user from local storage", e)
      }
      setShowLogout(true)
  }

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center px-4 gap-3 z-20 relative transition-colors duration-300">
        <button
          onClick={onMenu}
          className="xl:hidden text-xl dark:text-slate-400"
        >
          ☰
        </button>

        {/* Dynamic Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100/50 dark:border-slate-700/50 ml-2 transition-colors">
          <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-slate-500">home</span>
          {currentPage && (
            <>
              <span className="text-slate-300 dark:text-slate-600 font-normal">{">"}</span>
              <span className="text-slate-700 dark:text-slate-200 tracking-tight">{currentPage}</span>
            </>
          )}
        </div>

        <div className="flex-1" />

        <Input
          placeholder="Search..."
          className="max-w-[200px] h-9 text-xs focus-visible:ring-violet-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:placeholder:text-slate-500"
        />

        <div className="ml-auto flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90"
            title={isDark ? "Mặt trời" : "Mặt trăng"}
          >
            <span className="text-xl">
              {isDark ? "☀️" : "🌙"}
            </span>
          </button>
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <span className="text-xl">🔔</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-8 h-8 rounded-full bg-slate-300 cursor-pointer hover:ring-2 ring-violet-500 transition-all overflow-hidden">
                 <img src="https://github.com/shadcn.png" alt="User" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <span className="material-symbols-outlined mr-2 text-lg">person</span>
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span className="material-symbols-outlined mr-2 text-lg">settings</span>
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={handleShowLogout}
              >
                <span className="material-symbols-outlined mr-2 text-lg">logout</span>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {showLogout && (
        <LogoutModal 
          username={username}
          onConfirm={handleLogout} 
          onCancel={() => setShowLogout(false)} 
        />
      )}
    </>
  )
}
