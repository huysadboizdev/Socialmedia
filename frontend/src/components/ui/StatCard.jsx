import { Card, CardContent } from "./card"

export default function StatCard({ title, value, icon }) {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-pink-500 to-rose-600",
    "from-amber-500 to-orange-600"
  ]

  const gradient = gradients[Math.floor(Math.random() * gradients.length)]

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <CardContent className="p-5 flex items-center gap-4 relative">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
