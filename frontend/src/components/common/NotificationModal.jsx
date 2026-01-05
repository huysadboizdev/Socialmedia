import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function NotificationModal() {
  const [open, setOpen] = useState(true);


  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="text-2xl font-bold uppercase text-slate-800 dark:text-slate-100">
            THÔNG BÁO
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔔</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Chào Mừng Bạn Đến Với <span className="text-purple-600 font-bold">Sub6Sao.Com</span> Social Media 💖
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">👥</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tham Gia Nhóm <span className="text-purple-600 font-bold">Zalo</span> Nhận Thông Báo Mới Nhất
            </p>
          </div>
          
           <div className="flex items-start gap-3">
            <span className="text-xl">🔥</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
               Khuyến Mại Nạp <span className="inline-flex items-center justify-center size-6 rounded-full border border-cyan-400 text-xs font-bold text-cyan-600">11</span> % Từ <span className="inline-flex items-center justify-center size-6 rounded-full border border-cyan-400 text-xs font-bold text-cyan-600">1</span> ➖ <span className="inline-flex items-center justify-center size-6 rounded-full border border-cyan-400 text-xs font-bold text-cyan-600">3</span> Hàng Tháng
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">📲</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Zalo Hỗ Trợ : <span className="text-purple-600 font-bold">0383345622</span>
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🌐</span>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nhóm Zalo : <a href="#" className="text-purple-600 font-bold hover:underline">Tại Đây</a>
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🕒</span>
             <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Time Support : <span className="text-purple-600 font-bold">6:00 - 23:00</span>
            </p>
          </div>
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
