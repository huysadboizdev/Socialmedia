import Sidebar from "./Sidebar"
import Header from "./Header"
import { useState } from "react"

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden xl:block w-72 bg-white border-r">
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
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenu={() => setOpen(true)} />
        <main className="p-3 sm:p-4 md:p-6 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
