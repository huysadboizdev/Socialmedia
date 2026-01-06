// src/components/login-form.jsx
import axios from "axios"
import { useState } from "react"
import SharinganLoader from "./common/SharinganLoader"
import SuccessModal from "./common/SuccessModal"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const API_URL = import.meta.env.VITE_BACKEND_URL

// Zod validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(6, "Password must be at least 6 characters long"),
})

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  // Initialize react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/user/login`, {
        email: data.email,
        password: data.password,
      })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token)
        if (res.data.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        // Show success modal instead of immediate redirect
        setShowSuccess(res.data.user?.username || "HuySadBoiz")
      } else {
        toast.error(res.data.message || "Login failed")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    const userRole = JSON.parse(localStorage.getItem("user") || "{}").role;
    return (
      <SuccessModal 
        username={typeof showSuccess === 'string' ? showSuccess : undefined} 
        onConfirm={() => navigate(userRole === "admin" ? "/admin" : "/home")} 
      />
    );
  }

  return (
    <Card className="w-[380px] bg-zinc-900 text-white border-zinc-800 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 rounded-xl">
          <SharinganLoader size={80} />
        </div>
      )}
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

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      className="bg-zinc-800 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="bg-zinc-800 border-zinc-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-zinc-200"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="w-full border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => {
                window.location.href = `${API_URL}/auth/google`
              }}
            >
              Continue with Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
