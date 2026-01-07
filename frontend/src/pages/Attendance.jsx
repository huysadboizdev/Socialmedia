import SharinganLoader from "@/components/common/SharinganLoader";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

const rewards = [
  { day: 1, amount: "100đ" },
  { day: 2, amount: "1.000đ" },
  { day: 3, amount: "3.000đ" },
  { day: 4, amount: "5.000đ" },
  { day: 5, amount: "8.000đ" },
  { day: 6, amount: "20.000đ" },
  { day: 7, amount: "50.000đ" },
];

export default function Attendance() {
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [streak, setStreak] = useState(0); // 0-7
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
           const { attendance } = res.data.user;
           // Calculate local state based on attendance data
           if (attendance) {
             const lastDate = attendance.lastDate ? new Date(attendance.lastDate) : null;
             let isToday = false;
             
             if (lastDate) {
               const now = new Date();
               if (lastDate.getDate() === now.getDate() && 
                   lastDate.getMonth() === now.getMonth() && 
                   lastDate.getFullYear() === now.getFullYear()) {
                 isToday = true;
               }
             }

             setClaimedToday(isToday);
             // If claimed today, streak is current. If not, streak is pending (show next day)
             // But if last date was > 1 day ago, streak will reset on next claim. 
             // We can just show current streak from DB.
             // Wait, if I missed yesterday, my DB streak is old. 
             // Logic in backend resets streak on claim. Frontend should just show current DB streak if claimedToday, 
             // else show streak + 1 (potential) OR just show DB streak and highlight next.

             // Simplification: Just show DB streak. 
             // If claimedToday, streak is X. 
             // If NOT claimedToday, active day is streak + 1 (unless streak broken, then 1).
             // However, without claiming, we don't know if streak is broken yet safely without duplicating backend logic.
             // Let's rely on stored streak. 
             
             // Improvement:
             // If lastDate was yesterday, next is streak + 1.
             // If lastDate was older, next is 1.
             // If lastDate was today, current is streak.
             
             let computedStreak = attendance.streak || 0;
             if (!isToday && lastDate) { // Check if broken
                 const now = new Date();
                 const todayTs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                 const lastTs = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).getTime();
                 const oneDay = 24 * 60 * 60 * 1000;
                 
                 if (todayTs - lastTs > oneDay) {
                    computedStreak = 0; // Will reset to 1 on claim
                 }
             }

             setStreak(computedStreak); 
           }
        }
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [API_URL]);

  const handleClaim = async () => {
    if (claimedToday) return;
    setClaiming(true);
    
    try {
      const token = localStorage.getItem("token");
      // Use user ID from token middleware, but controller expects body... wait, controller extracts from body. 
      // Middleware usually injects into req.user or req.body?
      // authUser middleware usually adds userId to req.body.
      // So effectively we just need empty body or userId if client stores it.
      // But typically authUser handles it. Let's check authUser usage.
      // Usually passing {} is enough if authUser injects. 
      // Checking userController: const { userId } = req.body.
      // OK.
      
      const res = await axios.post(`${API_URL}/api/user/attendance`, {}, {
         headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setClaimedToday(true);
        setStreak(res.data.streak);
        toast.success(res.data.message);
        // Dispatch custom event to update balance in header if needed
        window.dispatchEvent(new Event('balanceUpdated'));
      } else {
        toast.error(res.data.message);
        if (res.data.message.includes("hôm nay")) {
            setClaimedToday(true);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi điểm danh");
    } finally {
      setClaiming(false);
    }
  };

  const getDayStatus = (day) => {
    // If we have claimed today, the streak includes today.
    // e.g. streak 1, claimed today -> Day 1 is claimed.
    // e.g. streak 2, claimed today -> Day 1, 2 claimed.
    
    // If NOT claimed today:
    // e.g. streak 1 (from yesterday) -> Day 1 claimed. Day 2 is "today" (pending).
    // e.g. streak 0 (broken) -> Day 1 is "today".
    
    if (loading) return "pending";

    if (claimedToday) {
       if (day <= streak) return "claimed";
       return "pending";
    } else {
       // Not claimed yet
       // If streak is 0 (broken/new), Day 1 is today.
       // If streak is 1 (yesterday), Day 1 claimed, Day 2 today.
       
       if (day <= streak) return "claimed";
       if (day === streak + 1) return "today";
       if (streak === 0 && day === 1) return "today"; // New/Reset
       return "pending";
    }
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
              const status = getDayStatus(r.day);
              const isToday = status === "today";
              const isClaimed = status === "claimed";
              
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
                  style={{ width: `${(streak / 7) * 100}%` }}
               />
            </div>
            <div className="text-center font-bold text-slate-500 dark:text-slate-400 text-sm font-['Lexend'] tracking-wide transition-colors">
              Đã hoàn thành: <span className="text-rose-500 dark:text-rose-400">{streak}</span> / 7 ngày
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleClaim}
            disabled={claimedToday || loading}
            className={`
              w-full md:w-auto px-20 py-5 rounded-[28px] font-black text-xl tracking-wide 
              transition-all duration-500 active:scale-95 shadow-2xl font-['Lexend']
              ${claimedToday 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none" 
                : "bg-gradient-to-r from-pink-400 via-rose-500 to-rose-400 text-white shadow-rose-200 dark:shadow-rose-900/40 hover:shadow-rose-400 dark:hover:shadow-rose-900/60 hover:brightness-110 hover:-translate-y-1"
              }
            `}
          >
            {loading ? "Đang tải..." : claimedToday ? "Ngày mai hãy quay lại nhé" : "Điểm danh"}
          </button>

        </div>
      </div>
    </div>
  );
}
