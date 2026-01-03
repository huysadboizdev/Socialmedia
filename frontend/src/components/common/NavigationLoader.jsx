import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SharinganLoader from "./SharinganLoader";

export default function NavigationLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wrap in a tiny timeout to avoid synchronous setState warning
    const showTimer = setTimeout(() => {
      setLoading(true);
    }, 0);
    
    // Hide loader after a short delay (e.g., 800ms)
    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] transition-all duration-300">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <SharinganLoader size={120} />
        <div className="flex flex-col items-center gap-1">
          <div className="text-xl font-black text-rose-500 font-['Lexend'] tracking-widest uppercase animate-pulse">
            Xin chờ...
          </div>
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.4em] uppercase opacity-50">
            Sub6sao.com
          </div>
        </div>
      </div>
    </div>
  );
}
