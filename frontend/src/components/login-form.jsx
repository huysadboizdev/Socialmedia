// src/components/login-form.jsx
import axios from "axios"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = import.meta.env.VITE_BACKEND_URL

export function LoginForm() {
  const [toast, setToast] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value

    try {
      const res = await axios.post(`${API_URL}/api/user/login`, {
        email,
        password,
      })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        setToast(true)
        setTimeout(() => {
          setToast(false)
          navigate("/home")
        }, 3000)
      }
    } catch (err) {
      console.error(err)
    }
  }

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

      {/* UI GIỮ NGUYÊN 100% */}
      <Card className="w-[380px] bg-zinc-900 text-white border-zinc-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Login to your account</CardTitle>
            <a href="/register" className="text-sm text-zinc-400 hover:underline">
              Sign Up
            </a>
          </div>
          <p className="text-sm text-zinc-400">
            Enter your email below to login to your account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <Input
              id="login-email"
              type="email"
              placeholder="m@example.com"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <Input
              id="login-password"
              type="password"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-white text-black hover:bg-zinc-200"
          >
            Login
          </Button>

          <Button
            variant="outline"
            className="w-full border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => {
            window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`
  }}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>

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
  )
}
