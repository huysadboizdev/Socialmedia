// src/components/register-form.jsx
import axios from "axios"
import { useState } from "react"
import SharinganLoader from "./common/SharinganLoader"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"

const API_URL = import.meta.env.VITE_BACKEND_URL

// Zod validation schema
const formSchema = z.object({
  username: z
    .string()
    .min(1, "Please enter your full name")
    .min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(6, "Password must be at least 6 characters long"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
  agreedToTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must agree to the terms and privacy policy",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)

  // Initialize react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/user/register`, {
        username: data.username,
        email: data.email,
        password_1: data.password,
        password_2: data.confirmPassword,
      })

      if (res.data.success) {
        toast.success("Đăng ký thành công! 🎉 Redirecting to login...")

        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      } else {
        toast.error(res.data.message || "Registration failed")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[380px] bg-zinc-900 text-white border-zinc-800 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 rounded-xl">
          <SharinganLoader size={80} />
        </div>
      )}
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Create account</CardTitle>
        <p className="text-sm text-zinc-400">
          Enter your details to get started
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
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
                      placeholder="Create a password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-enter password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Re-enter your password"
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
              name="agreedToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-zinc-400 leading-4 font-normal">
                      I agree to the{" "}
                      <a href="#" className="text-white hover:underline">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-white hover:underline">
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-zinc-200"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <div className="grid grid-cols-1 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="w-full border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Google
              </Button>
            </div>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <a href="/login" className="text-white hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
