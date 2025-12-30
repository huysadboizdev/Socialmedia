import AppLayout from "@/components/layout/AppLayout"
import StatCard from "@/components/ui/StatCard"
import AnnouncementCard from "@/components/ui/AnnouncementCard"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <AppLayout>
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjItMS43OS00LTQtNHMtNCAxLjc4LTQgNCAxLjc5IDQgNCA0IDQtMS43OCA0LTR6bTAtMTBjMC0yLjItMS43OS00LTQtNHMtNCAxLjc4LTQgNCAxLjc5IDQgNCA0IDQtMS43OCA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 animate-fade-in">
            Chào mừng đến Sub6Sao 🌟
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-0">
            Dịch vụ mạng xã hội uy tín, giá tốt nhất thị trường
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-300 rounded-full blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      {/* Stats */}
      <div className="
        grid grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-4 sm:gap-5
        mb-6
      ">
        <StatCard title="Số dư" value="0" icon="💰" />
        <StatCard title="Tổng nạp" value="0" icon="📈" />
        <StatCard title="Nạp tháng" value="0 USD" icon="📊" />
        <StatCard title="Thành viên" value="Cấp bậc" icon="👤" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <AnnouncementCard
            title="Admin 2025-12-02 12:28:09"
            items={[
              { icon: "🎁", text: "Điểm danh hằng ngày", link: "#" },
              { icon: "🍀", text: "Nhiệm vụ hằng ngày", link: "#" },
              { icon: "🏆", text: "Đua top nạp ngày", link: "#" },
              { icon: "🎉", text: "Tặng bạn 333k", link: "#" },
            ]}
          />

          <AnnouncementCard
            title="Admin 2025-12-02 11:31:20"
            items={[
              { icon: "📞", text: "Admin hỗ trợ Zalo: 0383345622" },
              { icon: "📢", text: "Kênh khuyến mãi", link: "#" },
              { icon: "⚙️", text: "Tài liệu API", link: "#" },
            ]}
          />
        </div>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-300"></div>
          <CardContent className="p-6 text-center space-y-4 relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              ✨
            </div>
            <h3 className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Bắt đầu ngay!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Trải nghiệm dịch vụ chất lượng cao với giá cả hợp lý. Đội ngũ hỗ trợ 24/7 luôn sẵn sàng phục vụ bạn.
            </p>
            <button className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              Khám phá ngay →
            </button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
