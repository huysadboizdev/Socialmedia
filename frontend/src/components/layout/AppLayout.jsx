import Sidebar from "./Sidebar"
import Header from "./Header"
import { useState } from "react"
import { Outlet } from "react-router-dom"
import ChatWidget from "../common/ChatWidget"

export default function AppLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar desktop */}
      <aside className="hidden xl:block w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-full shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 h-full bg-white dark:bg-slate-900 border-r dark:border-slate-800 animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
        <ChatWidget />
      </div>
    </div>
  )
}
