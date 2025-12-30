import { Card, CardContent } from "./card"

export default function AnnouncementCard({ title, items }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50">
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 h-1"></div>
      <CardContent className="p-5 sm:p-6 space-y-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-pulse"></div>
          <div className="font-bold text-base bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">{title}</div>
        </div>

        <div className="space-y-3">
          {items.map((i, idx) => (
            <div key={idx} className="flex gap-3 items-start group/item hover:translate-x-1 transition-transform duration-200">
              <span className="text-xl mt-0.5 group-hover/item:scale-110 transition-transform duration-200">{i.icon}</span>
              <span className="flex-1 text-slate-700 dark:text-slate-300">
                {i.text}
                {i.link && (
                  <a href={i.link} className="ml-2 text-violet-600 dark:text-violet-400 hover:text-purple-600 dark:hover:text-purple-400 underline decoration-dotted underline-offset-2 font-medium transition-colors duration-200">
                    Tại đây →
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
