// src/components/login-form.jsx
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_URL = import.meta.env.VITE_BACKEND_URL

export function LoginForm() {
  const handleLogin = async () => {
    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value

    try {
      const res = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      })
      console.log(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
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
        >
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  )
}
