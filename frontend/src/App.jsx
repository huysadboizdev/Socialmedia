// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import { Suspense, lazy } from "react"
import SharinganLoader from "./components/common/SharinganLoader"

const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Home = lazy(() => import("./pages/Home"))
const Profile = lazy(() => import("./pages/Profile"))

import AppLayout from "./components/layout/AppLayout"

function App() {
  return (
    <BrowserRouter>
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
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

