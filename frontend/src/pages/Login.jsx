// src/pages/Login.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// toast removed
import { LoginForm } from "@/components/login-form";
import SharinganLoader from "@/components/common/SharinganLoader";
import SuccessModal from "@/components/common/SuccessModal";

import axios from "axios";
const API_URL = import.meta.env.VITE_BACKEND_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasShownSuccess = useRef(false);
  const token = searchParams.get("token");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (token && !hasShownSuccess.current) {
      hasShownSuccess.current = true;
      localStorage.setItem("token", token);
      
      // Fetch user info to show name
      axios.get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
         const name = res.data.user?.username || res.data.user?.name || "HuySadBoiz";
         // Store user info in localStorage if needed for other parts of app
         if (res.data.user) {
             localStorage.setItem("user", JSON.stringify(res.data.user));
         }
         setTimeout(() => setShowSuccess(name), 0);
      })
      .catch((err) => {
         console.error("Fetch user error:", err);
         setTimeout(() => setShowSuccess("HuySadBoiz"), 0);
      });
    }
  }, [token, navigate]);

  const handleConfirm = () => {
    navigate("/home");
  };

  if (showSuccess) {
    return <SuccessModal username={typeof showSuccess === 'string' ? showSuccess : undefined} onConfirm={handleConfirm} />;
  }

  if (token) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
        <SharinganLoader size={140} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
