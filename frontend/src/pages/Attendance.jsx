import SharinganLoader from "@/components/common/SharinganLoader";
import { useState } from "react";
import { toast } from "sonner";

const rewards = [
  { day: 1, amount: "100đ", status: "claimed" },
  { day: 2, amount: "1000đ", status: "today" },
  { day: 3, amount: "3000đ", status: "pending" },
  { day: 4, amount: "5000đ", status: "pending" },
  { day: 5, amount: "8000đ", status: "pending" },
  { day: 6, amount: "20000đ", status: "pending" },
  { day: 7, amount: "50000đ", status: "pending" },
];

export default function Attendance() {
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);

  const handleClaim = () => {
    if (claimedToday) return;
    setClaiming(true);
    // Simulate API call
    setTimeout(() => {
      setClaiming(false);
      setClaimedToday(true);
      toast.success("Điểm danh thành công! +1000đ");
    }, 1500);
  };

  return (
    <div className="flex-1 min-h-full flex flex-col">
      {claiming && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <SharinganLoader size={140} />
        </div>
      )}

      <div className="w-full p-4 md:p-6 lg:p-8 space-y-8 flex-1 flex flex-col items-center">

        {/* Main Card */}
        <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 shadow-[0_30px_70px_-20px_rgba(255,100,150,0.2)] dark:shadow-[0_30px_70px_-20px_rgba(255,100,150,0.1)] border border-pink-50 dark:border-pink-900/20 relative overflow-hidden flex flex-col items-center space-y-12 transition-colors">
          
          {/* Subtle Glow Header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-pink-400 dark:via-pink-500 to-transparent blur-sm" />

          {/* Title Section */}
          <div className="text-center space-y-5">
            <h1 className="text-4xl md:text-6xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 font-['Pattaya'] py-2">
              Điểm danh hằng ngày
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg md:text-2xl font-['Lexend'] tracking-tight">
              Nhận Quà Lên Đến <span className="text-rose-500 dark:text-rose-400">100k</span>
            </p>
            <div className="text-slate-400 dark:text-slate-600 font-bold text-xs tracking-[0.3em] uppercase opacity-70">Sub6sao.com</div>
          </div>

          {/* Reward Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-5 w-full">
            {rewards.map((r) => {
              const isToday = r.status === "today" && !claimedToday;
              const isClaimed = r.status === "claimed" || (r.status === "today" && claimedToday);
              
              return (
                <div 
                  key={r.day}
                  className={`
                    relative group rounded-[24px] p-5 flex flex-col items-center justify-center gap-2.5 
                    transition-all duration-500 border-2
                    ${isClaimed 
                      ? "bg-pink-50/50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800" 
                      : isToday 
                        ? "bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900 border-yellow-300 dark:border-yellow-700 shadow-[0_15px_30px_rgba(253,224,71,0.2)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.3)] scale-105" 
                        : "bg-white dark:bg-slate-800/40 border-slate-50 dark:border-slate-800 grayscale hover:grayscale-0 hover:border-pink-100 dark:hover:border-pink-900 shadow-sm"
                    }
                  `}
                >
                  {/* Status Icons */}
                  {isClaimed && (
                    <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1 shadow-lg z-10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] font-bold">done</span>
                    </div>
                  )}
                  {isToday && (
                    <div className="absolute -top-3 -right-3 text-yellow-500 animate-bounce transition-transform duration-300 group-hover:scale-125 z-10">
                      <span className="material-symbols-outlined text-[28px] drop-shadow-sm">redeem</span>
                    </div>
                  )}

                  <div className={`text-xl font-black font-['Lexend'] tracking-tighter ${isClaimed ? "text-pink-500 dark:text-pink-400" : isToday ? "text-yellow-600 dark:text-yellow-400" : "text-gray-300 dark:text-slate-700"}`}>
                    {r.amount}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${isClaimed ? "text-pink-400/80 dark:text-pink-500" : isToday ? "text-yellow-500" : "text-gray-300 dark:text-slate-700"}`}>
                    Ngày {r.day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar Section */}
          <div className="w-full max-w-2xl space-y-5">
            <div className="h-3 w-full bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden flex shadow-inner border border-slate-100 dark:border-slate-800 transition-colors">
               <div 
                  className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-pink-500 transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                  style={{ width: `${(claimedToday ? 2 : 1) / 7 * 100}%` }}
               />
            </div>
            <div className="text-center font-bold text-slate-500 dark:text-slate-400 text-sm font-['Lexend'] tracking-wide transition-colors">
              Đã hoàn thành: <span className="text-rose-500 dark:text-rose-400">{claimedToday ? 2 : 1}</span> / 7 ngày
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleClaim}
            disabled={claimedToday}
            className={`
              w-full md:w-auto px-20 py-5 rounded-[28px] font-black text-xl tracking-wide 
              transition-all duration-500 active:scale-95 shadow-2xl font-['Lexend']
              ${claimedToday 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none" 
                : "bg-gradient-to-r from-pink-400 via-rose-500 to-rose-400 text-white shadow-rose-200 dark:shadow-rose-900/40 hover:shadow-rose-400 dark:hover:shadow-rose-900/60 hover:brightness-110 hover:-translate-y-1"
              }
            `}
          >
            {claimedToday ? "Ngày mai hãy quay lại nhé" : "Điểm danh"}
          </button>

        </div>
      </div>
    </div>
  );
}
