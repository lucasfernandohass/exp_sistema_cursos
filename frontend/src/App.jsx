import { Routes, Route } from "react-router-dom"

import PrivateRoute from "./routes/PrivateRoutes"
import AdminRoute from "./routes/AdminRoute"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CoursesPage from "./pages/Courses"
import Dashboard from "./pages/Dashboard"
import Course from "./pages/Course"
import AdminCourses from "./pages/AdminCourses"

export default function App() {
  return (
    <Routes>

      {/* =========================
          ROTAS PÚBLICAS
      ========================= */}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Register />} />
      <Route path="/cursos" element={<CoursesPage />} />

      {/* =========================
          ROTAS PROTEGIDAS (ALUNO)
      ========================= */}

      <Route
        path="/painel-aluno"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/curso/:id"
        element={
          <PrivateRoute>
            <Course />
          </PrivateRoute>
        }
      />

      {/* =========================
          ROTAS ADMINISTRADOR
      ========================= */}

      <Route
        path="/admin/cursos"
        element={
          <AdminRoute>
            <AdminCourses />
          </AdminRoute>
        }
      />

    </Routes>
  )
}