import { Card, CardContent, CardHeader, CardTitle } from "./card"

export default function StatCard({ title, value, icon, trend }) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
        <span className="text-xl text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent className="px-6 pb-4">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

