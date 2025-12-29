export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
      <input
        placeholder="Search..."
        className="border px-3 py-1 rounded w-64"
      />

      <div className="flex items-center gap-4">
        <button>🌙</button>
        <button>🔔</button>
        <div className="w-8 h-8 rounded-full bg-gray-300" />
      </div>
    </header>
  )
}
