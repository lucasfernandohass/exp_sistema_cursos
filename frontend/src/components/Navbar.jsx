import { Link } from "react-router-dom"
import { useState } from "react"

import ConfirmModal from "./ConfirmModal"
import MobileMenu from "./MobileMenu"

import { useAuth } from "../context/AuthContext"

/* =========================
   PILL DE USUÁRIO
   Reutilizado no desktop e mobile
========================= */

function UserPill({ user, isAdmin, menuOpen, onToggle, onClose, onLogout }) {
  return (
    <div className="user-menu">

      <button className="user-pill-btn" onClick={onToggle} aria-label="Menu do usuário">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="user-pill-name">
          {user.nome?.split(" ")[0] || "Perfil"}
        </span>
        {isAdmin && <span className="user-pill-admin-badge">Admin</span>}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          className={`user-pill-chevron${menuOpen ? " open" : ""}`}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div className="user-backdrop" onClick={onClose} />
          <div className="user-dropdown">
            <div className="user-dropdown-name">{user.nome}</div>
            <div className="user-dropdown-email">{user.email}</div>
            <hr className="user-divider" />

            {isAdmin ? (
              <Link to="/admin/cursos" className="user-dropdown-item" onClick={onClose}>
                ⚙️ Painel Admin
              </Link>
            ) : (
              <>
                <Link to="/painel-aluno" className="user-dropdown-item" onClick={onClose}>
                  <b>Painel Aluno</b>
                </Link>
              </>
            )}

            <hr className="user-divider" />
            <button className="user-dropdown-item user-dropdown-logout" onClick={onLogout}>
              Sair da conta
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* =========================
   NAVBAR
========================= */

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()

  const [showConfirm, setShowConfirm] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const pillProps = {
    user,
    isAdmin,
    menuOpen: userMenuOpen,
    onToggle: () => setUserMenuOpen((v) => !v),
    onClose:  () => setUserMenuOpen(false),
    onLogout: () => { setUserMenuOpen(false); setShowConfirm(true) },
  }

  return (
    <>
      {/* =========================
          DESKTOP NAVBAR
      ========================= */}
      <nav className="navbar desktop-nav">
        <div className="container nav-container">

          <div className="nav-left">
            <Link to="/" className="logo">
              <div className="logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="logo-text">Aprenda+</span>
            </Link>

            {/* links só aparecem fora do painel admin */}
            {!isAdmin && (
              <nav className="nav-links">
                <Link to="/cursos">Cursos</Link>
                <Link to="/sobre">Sobre nós</Link>
                <Link to="/contato">Entre em contato</Link>
              </nav>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <UserPill {...pillProps} />
            ) : (
              <>
                <Link to="/login"><button className="btn-login">Login</button></Link>
                <Link to="/registrar"><button className="btn-primary">Cadastrar</button></Link>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* =========================
          MOBILE NAVBAR
      ========================= */}
      <nav className="navbar mobile-nav">
        <div className="container nav-container">

          <div className="nav-left">
            <button
              className="hamburger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? (
                <span className="hamburger-close">✕</span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <Link to={isAdmin ? "/admin/cursos" : "/"} className="logo mobile-logo" onClick={() => setMobileOpen(false)}>
              <div className="logo-icon mobile-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="logo-text mobile-logo-text">Aprenda+</span>
            </Link>
          </div>

        </div>

        <MobileMenu
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          user={user}
          isAdmin={isAdmin}
          onLogout={() => setShowConfirm(true)}
        />
      </nav>

      {/* MODAL LOGOUT */}
      <ConfirmModal
        visible={showConfirm}
        title="Confirmar logout"
        message="Deseja realmente sair da sua conta?"
        onConfirm={() => { setShowConfirm(false); signOut() }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
