import { Input } from "@/components/ui/input"

export default function Header({ onMenu }) {
  return (
    <header className="h-14 bg-white border-b flex items-center px-4 gap-3">
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
        <div className="w-8 h-8 rounded-full bg-slate-300" />
      </div>
    </header>
  )
}
