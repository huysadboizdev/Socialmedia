// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense, lazy } from "react"
import SharinganLoader from "./components/common/SharinganLoader"

const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Landing = lazy(() => import("./pages/Landing"))
const Home = lazy(() => import("./pages/Home"))
const Profile = lazy(() => import("./pages/Profile"))
const Attendance = lazy(() => import("./pages/Attendance"))
const DailyTask = lazy(() => import("./pages/DailyTask"))
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"))
const AllOrders = lazy(() => import("./pages/AllOrders"))
const FacebookLike = lazy(() => import("./pages/facebook/FacebookLike"));
const FacebookFollow = lazy(() => import("./pages/facebook/FacebookFollow"));
const FacebookShare = lazy(() => import("./pages/facebook/FacebookShare"));
const FacebookBlue = lazy(() => import("./pages/facebook/FacebookBlue"));
const TiktokLike = lazy(() => import("./pages/tiktok/TiktokLike"))
const TiktokFollow = lazy(() => import("./pages/tiktok/TiktokFollow"))
const TiktokShare = lazy(() => import("./pages/tiktok/TiktokShare"))
const InstagramFollow = lazy(() => import("./pages/instagram/InstagramFollow"))
const InstagramLike = lazy(() => import("./pages/instagram/InstagramLike"))
const InstagramShare = lazy(() => import("./pages/instagram/InstagramShare"))
const InstagramBlue = lazy(() => import("./pages/instagram/InstagramBlue"))
const Support = lazy(() => import("./pages/Support"))
const Terms = lazy(() => import("./pages/Terms"))

import AppLayout from "./components/layout/AppLayout"
import AdminLayout from "./components/layout/AdminLayout"

import NavigationLoader from "./components/common/NavigationLoader"

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"))
const AdminServices = lazy(() => import("./pages/admin/AdminServices"))
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"))

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
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected/Dashboard Routes - with Persistent Sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/daily-task" element={<DailyTask />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/all-orders" element={<AllOrders />} />
            <Route path="/service/facebook-like" element={<FacebookLike />} />
            <Route path="/service/facebook-follow" element={<FacebookFollow />} />
            <Route path="/service/facebook-share" element={<FacebookShare />} />
            <Route path="/service/facebook-blue" element={<FacebookBlue />} />
            <Route path="/service/tiktok-like" element={<TiktokLike />} />
            <Route path="/service/tiktok-follow" element={<TiktokFollow />} />
            <Route path="/service/tiktok-share" element={<TiktokShare />} />
            <Route path="/service/instagram-follow" element={<InstagramFollow />} />
            <Route path="/service/instagram-like" element={<InstagramLike />} />
            <Route path="/service/instagram-share" element={<InstagramShare />} />
            <Route path="/service/instagram-blue" element={<InstagramBlue />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

