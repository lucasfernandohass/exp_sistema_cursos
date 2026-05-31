import { Routes, Route } from "react-router-dom"

import PrivateRoute from "./routes/PrivateRoutes"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import EnrolledCourses from "./pages/EnrolledCourses"
import Course from "./pages/Courses"

export default function App() {
  return (
    <Routes>

      {/* =========================
          ROTAS PÚBLICAS
      ========================= */}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* =========================
          ROTAS PROTEGIDAS (ALUNO)
      ========================= */}

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/matriculados"
        element={
          <PrivateRoute>
            <EnrolledCourses />
          </PrivateRoute>
        }
      />

      <Route
        path="/course/:id"
        element={
          <PrivateRoute>
            <Course />
          </PrivateRoute>
        }
      />

    </Routes>
  )
}