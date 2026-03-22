import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function TwoFactorPromptModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  async function check2FAStatus() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const userData = res.data.user;
        setUser(userData);
        
        // Show modal if 2FA is enabled but not verified for this session,
        // OR if 2FA is not enabled at all (forcing/encouraging 2FA for sensitive actions)
        if (!userData.is2FAVerified) {
          setOpen(true);
        }
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  }

  useEffect(() => {
    // Sensitive routes that require 2FA
    const sensitiveRoutes = [
      "/deposit",
      "/service/",
      "/missions",
      "/mission/",
      "/attendance",
      "/history"
    ];

    const isSensitive = sensitiveRoutes.some(route => location.pathname.startsWith(route));
    
    if (isSensitive) {
      void (async () => {
        await check2FAStatus();
      })();
    }
  }, [location.pathname]);

  const handleConfirm = () => {
    setOpen(false);
    navigate("/profile", { state: { tab: "2fa" } });
  };

  const handleClose = () => {
    setOpen(false);
    // Redirect away from sensitive page if they cancel? 
    // Usually it's better to just keep the modal open or redirect to home.
    navigate("/home");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) handleClose(); }}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto size-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-3xl text-amber-600 dark:text-amber-500">lock</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 uppercase">
            Yêu Cầu Xác Thực
          </DialogTitle>
          <DialogDescription className="text-center text-slate-600 dark:text-slate-400 font-medium">
            {user?.is2FAEnabled 
              ? "Bạn cần xác minh mã qua Email để thực hiện hành động này." 
              : "Vui lòng kích hoạt xác thực 2 yếu tố để bảo vệ tài khoản và sử dụng dịch vụ này."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 font-bold h-12"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl h-12 shadow-lg shadow-violet-500/20"
          >
            {user?.is2FAEnabled ? "Xác minh ngay" : "Cài đặt ngay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
