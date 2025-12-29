// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      setToast(true);
      setTimeout(() => {
        setToast(false);
        navigate("/home");
      }, 3000);
    }
  }, [searchParams, navigate]);

  return (
    <>
      {/* TOAST – GIỐNG HÌNH */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-toast">
          <div className="flex items-center gap-3 bg-white text-gray-800 px-4 py-3 rounded-md shadow-lg min-w-[260px]">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm">Đăng nhập thành công</span>
            <button
              onClick={() => setToast(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center">
        <LoginForm />
      </div>

      {/* animation */}
      <style>
        {`
          @keyframes toastIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-toast {
            animation: toastIn 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
}
