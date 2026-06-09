import { Routes, Route } from "react-router-dom"

import PrivateRoute from "./routes/PrivateRoutes"
import AdminRoute from "./routes/AdminRoute"

import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Registrar"
import CursosPage from "./pages/Cursos"
import CursoDetalhe from "./pages/Curso"
import Dashboard from "./pages/Painel-aluno"
import Course from "./pages/Curso"
import AdminCourses from "./pages/AdminCourses"
import SobreNos from "./pages/SobreNos"
import Contato from "./pages/Contato"

export default function App() {
  return (
    <Routes>

      {/* =========================
          ROTAS PÚBLICAS
      ========================= */}

      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/registrar"  element={<Register />} />
      <Route path="/cursos"    element={<CursosPage />} />
      <Route path="/curso/:id" element={<CursoDetalhe />} />
      <Route path="/sobre" element={<SobreNos />} />
      <Route path="/contato"   element={<Contato />} />

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
        path="/aula/:id"
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