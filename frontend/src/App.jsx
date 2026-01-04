// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense, lazy } from "react"
import SharinganLoader from "./components/common/SharinganLoader"

const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Home = lazy(() => import("./pages/Home"))
const Profile = lazy(() => import("./pages/Profile"))
const Attendance = lazy(() => import("./pages/Attendance"))
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"))
const FacebookLike = lazy(() => import("./pages/facebook/FacebookLike"))
const FacebookFollow = lazy(() => import("./pages/facebook/FacebookFollow"))
const FacebookShare = lazy(() => import("./pages/facebook/FacebookShare"))
const TiktokLike = lazy(() => import("./pages/tiktok/TiktokLike"))
const TiktokFollow = lazy(() => import("./pages/tiktok/TiktokFollow"))
const TiktokShare = lazy(() => import("./pages/tiktok/TiktokShare"))
const InstagramFollow = lazy(() => import("./pages/instagram/InstagramFollow"))
const InstagramLike = lazy(() => import("./pages/instagram/InstagramLike"))
const InstagramShare = lazy(() => import("./pages/instagram/InstagramShare"))

import AppLayout from "./components/layout/AppLayout"

import NavigationLoader from "./components/common/NavigationLoader"

function App() {
  return (
    <BrowserRouter>
      <NavigationLoader />
      <Toaster position="top-right" richColors />
      <Suspense
        fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <SharinganLoader size={140} />
          </div>
        }
      >
        <Routes>
          {/* Public Routes - Centered */}
          <Route element={
            <div className="flex min-h-svh items-center justify-center w-full">
              <Outlet />
            </div>
          }>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected/Dashboard Routes - with Persistent Sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/service/facebook-like" element={<FacebookLike />} />
            <Route path="/service/facebook-follow" element={<FacebookFollow />} />
            <Route path="/service/facebook-share" element={<FacebookShare />} />
            <Route path="/service/tiktok-like" element={<TiktokLike />} />
            <Route path="/service/tiktok-follow" element={<TiktokFollow />} />
            <Route path="/service/tiktok-share" element={<TiktokShare />} />
            <Route path="/service/instagram-follow" element={<InstagramFollow />} />
            <Route path="/service/instagram-like" element={<InstagramLike />} />
            <Route path="/service/instagram-share" element={<InstagramShare />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

