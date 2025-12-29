// src/components/register-form.jsx
import axios from "axios"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const API_URL = import.meta.env.VITE_BACKEND_URL

export function RegisterForm() {
  const [checked, setChecked] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false) 

  const handleRegister = async () => {
    const username = document.getElementById("reg-name").value
    const email = document.getElementById("reg-email").value
    const password_1 = document.getElementById("reg-password").value
    const password_2 = document.getElementById("reg-password2").value

    try {
      const res = await axios.post(`${API_URL}/api/user/register`, {
        username,
        email,
        password_1,
        password_2,
      })

      if (res.data.success) {
        setShowSuccess(true) 
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      } else {
        alert(res.data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-register-success">
          <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
            Đăng ký thành công 🎉
          </div>
        </div>
      )}

      <Card className="w-[380px] bg-zinc-900 text-white border-zinc-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl">Create account</CardTitle>
          <p className="text-sm text-zinc-400">
            Enter your details to get started
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Full name</label>
            <Input id="reg-name" placeholder="Enter your full name" className="bg-zinc-800 border-zinc-700" />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <Input id="reg-email" type="email" placeholder="name@example.com" className="bg-zinc-800 border-zinc-700" />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <Input id="reg-password" type="password" placeholder="Create a password" className="bg-zinc-800 border-zinc-700" />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Re-enter password</label>
            <Input id="reg-password2" type="password" placeholder="Re-enter your password" className="bg-zinc-800 border-zinc-700" />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox id="terms" checked={checked} onCheckedChange={(v) => setChecked(!!v)} />
            <label htmlFor="terms" className="text-sm text-zinc-400 leading-4">
              I agree to the <a href="#" className="text-white hover:underline">Terms</a> and{" "}
              <a href="#" className="text-white hover:underline">Privacy Policy</a>
            </label>
          </div>

          <Button disabled={!checked} onClick={handleRegister} className="w-full bg-white text-black hover:bg-zinc-200">
            Create account
          </Button>

          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="w-full border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <a href="/login" className="text-white hover:underline">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>

      {/* ✅ CSS animation */}
      <style>
        {`
          @keyframes registerSuccess {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-register-success {
            animation: registerSuccess 0.3s ease-out;
          }
        `}
      </style>
    </>
  )
}
