import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

import ConfirmModal from "./ConfirmModal"
import { useAuth } from "../context/AuthContext"

export default function Sidebar() {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const [showConfirm, setShowConfirm] = useState(false)

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link to="/dashboard" className="sidebar-logo">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22 10L12 15L2 10L12 5L22 10Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 10V14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2>Aprenda+</h2>
        </Link>

        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar" aria-hidden="true">
              {user.nome?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="sidebar-user-info">
              <strong>Olá, {user.nome?.split(" ")[0]}!</strong>
              <span>{user.email}</span>
            </div>
          </div>
        )}

        <nav className="sidebar-links">
          <Link
            to="/dashboard"
            className={isActive("/dashboard") ? "active" : ""}
          >
            Home
          </Link>

          <Link
            to="/matriculados"
            className={isActive("/matriculados") ? "active" : ""}
          >
            Meus Cursos
          </Link>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button
          className="sidebar-logout"
          onClick={() => setShowConfirm(true)}
        >
          Sair da conta
        </button>
      </div>

      <ConfirmModal
        visible={showConfirm}
        title="Confirmar logout"
        message="Deseja realmente sair da sua conta?"
        onConfirm={() => { setShowConfirm(false); signOut() }}
        onCancel={() => setShowConfirm(false)}
      />
    </aside>
  )
}
