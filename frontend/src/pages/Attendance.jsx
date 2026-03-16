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
             let isToday = false;
             const lastDate = attendance.lastDate ? new Date(attendance.lastDate) : null;
             
             // Get current time in Vietnam timezone
             const nowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
             const vnNow = new Date(nowStr);
             
             if (lastDate) {
               // Get lastDate in Vietnam timezone
               const lastStr = lastDate.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
               const vnLast = new Date(lastStr);
               
               if (vnLast.getDate() === vnNow.getDate() && 
                   vnLast.getMonth() === vnNow.getMonth() && 
                   vnLast.getFullYear() === vnNow.getFullYear()) {
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
             if (lastDate) { 
                 const lastStr = lastDate.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
                 const vnLast = new Date(lastStr);
                 if (vnNow.getMonth() !== vnLast.getMonth() || vnNow.getFullYear() !== vnLast.getFullYear()) {
                    computedStreak = 0; // Reset on new month
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
    <div className="flex-1 min-h-full flex flex-col bg-[#fff5f7]">
      {claiming && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-[9999]">
          <SharinganLoader size={120} />
        </div>
      )}

      <div className="w-full p-4 md:p-8 lg:p-12 space-y-8 flex-1 flex flex-col items-center justify-center">

        {/* Main Card */}
        <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[60px] p-8 md:p-16 lg:p-20 shadow-[0_40px_100px_-20px_rgba(255,182,193,0.3)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-pink-50 dark:border-pink-900/10 relative flex flex-col items-center space-y-16 transition-all">
          
          {/* Title Section */}
          <div className="text-center space-y-6">
            <h1 className="text-3xl md:text-5xl font-medium text-slate-900 dark:text-white tracking-tight py-2 leading-tight">
              Điểm danh hằng ngày
            </h1>
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300 font-medium text-lg md:text-2xl tracking-tight">
                Nhận Quà Lên Đến <span className="text-[#FF1493] dark:text-[#FF69B4]">100k</span>
              </p>
              <div className="text-slate-300 dark:text-slate-600 font-medium text-[10px] tracking-[0.6em] uppercase">SUB6SAO.COM</div>
            </div>
          </div>

          {/* Reward Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 w-full">
            {rewards.map((r) => {
              const status = getDayStatus(r.day);
              const isToday = status === "today";
              const isClaimed = status === "claimed";
              
              return (
                <div 
                  key={r.day}
                  className={`
                    relative rounded-[32px] p-6 aspect-square flex flex-col items-center justify-center gap-2
                    transition-all duration-500 border
                    ${isClaimed 
                      ? "bg-white border-[#FFB6C1] shadow-[0_10px_25px_rgba(255,182,193,0.2)]" 
                      : isToday 
                        ? "bg-white border-[#FFB6C1] shadow-[0_15px_30px_rgba(255,182,193,0.3)] scale-105" 
                        : "bg-white border-slate-100 dark:border-slate-800 opacity-60 grayscale-[0.5]"
                    }
                  `}
                >
                  {/* Status Circle Badge */}
                  {(isClaimed || (isToday && claimedToday)) && (
                    <div className="absolute -top-3 -right-3 bg-[#FF1493] text-white rounded-full size-8 shadow-lg z-10 flex items-center justify-center border-4 border-white">
                      <span className="material-symbols-outlined text-[16px] font-bold">done</span>
                    </div>
                  )}

                  <div className={`text-xl font-bold ${isClaimed || (isToday && claimedToday) ? "text-[#FF1493]" : "text-slate-400"}`}>
                    {r.amount}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isClaimed || (isToday && claimedToday) ? "text-[#FFB6C1]" : "text-slate-300"}`}>
                    NGÀY {r.day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Section */}
          <div className="w-full max-w-2xl space-y-6">
            <div className="h-2 w-full bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden flex shadow-inner border border-slate-50 dark:border-slate-800 transition-all">
               <div 
                  className="h-full bg-gradient-to-r from-[#FFB6C1] to-[#FF1493] transition-all duration-1000" 
                  style={{ width: `${(streak / 7) * 100}%` }}
               />
            </div>
            <div className="text-center font-bold text-slate-400 dark:text-slate-500 text-sm tracking-wide">
              Đã hoàn thành: <span className="text-slate-600 dark:text-slate-300">{streak} / 7 ngày</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleClaim}
            disabled={claimedToday || streak >= 7 || loading}
            className={`
              w-full md:w-auto px-24 py-6 rounded-[35px] font-bold text-xl tracking-tight
              transition-all duration-500 active:scale-[0.98]
              ${(claimedToday || streak >= 7)
                ? "bg-[#edf2f7] dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#FFB6C1] to-[#FF69B4] text-white shadow-xl shadow-pink-200 dark:shadow-none hover:shadow-2xl hover:-translate-y-1"
              }
            `}
          >
            {loading ? "Đang tải..." : streak >= 7 ? "Hẹn tháng sau nhé!" : claimedToday ? "Ngày mai hãy quay lại nhé" : "Điểm danh ngay"}
          </button>

        </div>
      </div>
    </div>
  );
}
