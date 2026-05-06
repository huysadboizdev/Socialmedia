import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function NotificationModal() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({
    title: "THÔNG BÁO",
    items: [
      { icon: "🔔", text: "Chào Mừng Bạn Đến Với Sub6Sao.Com Social Media 💖" },
      { icon: "👥", text: "Tham Gia Nhóm Zalo Nhận Thông Báo Mới Nhất" },
      { icon: "🔥", text: "Khuyến Mại Nạp 11 % Từ 1 ➖ 3 Hàng Tháng" },
      { icon: "📲", text: "Zalo Hỗ Trợ : 0383345622" },
      { icon: "🌐", text: "Nhóm Zalo : Tại Đây" },
      { icon: "🕒", text: "Time Support : 6:00 - 23:00" },
    ],
  });

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/announcement`);
        if (res.data.success && res.data.announcement) {
          setAnnouncement(res.data.announcement);
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, [API_URL]);

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="text-2xl font-bold uppercase text-slate-800 dark:text-slate-100">
            {announcement.title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          {announcement.items.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-xl">{item.icon}</span>
              <p
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                dangerouslySetInnerHTML={{
                  __html: item.text
                    .replace(/Sub6Sao\.Com/g, '<span class="text-purple-600 font-bold">Sub6Sao.Com</span>')
                    .replace(/Zalo/g, '<span class="text-purple-600 font-bold">Zalo</span>')
                    .replace(/(\d{10,})/g, '<span class="text-purple-600 font-bold">$1</span>')
                    .replace(/(\d+)\s*%/g, '<span class="inline-flex items-center justify-center size-6 rounded-full border border-cyan-400 text-xs font-bold text-cyan-600">$1</span> %')
                    .replace(/Tại Đây/g, '<a href="https://zalo.me/0763076124" target="_blank" rel="noopener noreferrer" class="text-purple-600 font-bold hover:underline">Tại Đây</a>')
                    .replace(/(\d+:\d+\s*-\s*\d+:\d+)/g, '<span class="text-purple-600 font-bold">$1</span>')
                }}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="p-6 pt-2 flex justify-end">
          <Button
            onClick={handleClose}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-6"
          >
            Tôi đã đọc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
