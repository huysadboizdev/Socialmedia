import Sidebar from "./Sidebar"
import Header from "./Header"
import { useState } from "react"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden xl:block w-72 bg-white border-r h-full flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 h-full bg-white border-r">
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header onMenu={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
