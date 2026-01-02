import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import LogoutModal from "../common/LogoutModal"
import { useNavigate } from "react-router-dom"

export default function Header({ onMenu }) {
  const [showLogout, setShowLogout] = useState(false)
  const navigate = useNavigate()
  const [username, setUsername] = useState("")

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setShowLogout(false)
    navigate("/login")
  }

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
      <header className="h-14 bg-white border-b flex items-center px-4 gap-3 z-20 relative">
        <button
          onClick={onMenu}
          className="xl:hidden text-xl"
        >
          ☰
        </button>

        <Input
          placeholder="Search..."
          className="max-w-xs"
        />

        <div className="ml-auto flex items-center gap-3">
          <button>🌙</button>
          <button>🔔</button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-8 h-8 rounded-full bg-slate-300 cursor-pointer hover:ring-2 ring-violet-500 transition-all overflow-hidden">
                 <img src="https://github.com/shadcn.png" alt="User" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
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
