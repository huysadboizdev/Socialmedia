// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh items-center justify-center">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
