import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import ConfirmModal from "./ConfirmModal"
import MobileMenu from "./MobileMenu"

export default function Navbar() {
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"))
    } catch {
      return null
    }
  })
  const [showConfirm, setShowConfirm] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")))
      } catch {
        setUser(null)
      }
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  function handleLogout() {
    // abrir modal de confirmação
    setShowConfirm(true)
  }

  function cancelLogout() {
    setShowConfirm(false)
  }

  function confirmLogout() {
    setShowConfirm(false)
    localStorage.removeItem("user")
    setUser(null)
    navigate("/login")
  }

  function toggleMobile() {
    setMobileOpen((v) => !v)
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar desktop-nav">
        <div className="container nav-container">

          <div className="nav-left">

            <div className="logo">
              <Link to="/" className="logo">
                <div className="logo-icon">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                </div>

                <span className="logo-text">Aprenda+</span>
              </Link>
            </div>

            <div className="nav-links">
            </div>

          </div>

          <div className="nav-actions">

            {user ? (
              <>
                <Link to="/dashboard">
                  <button className="btn-login">{user.nome || 'Dashboard'}</button>
                </Link>

                <button className="btn-logout" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="btn-login">Login</button>
                </Link>

                <Link to="/register">
                  <button className="btn-primary">Cadastrar</button>
                </Link>
              </>
            )}

            <ConfirmModal
              visible={showConfirm}
              title="Confirmar logout"
              message="Deseja realmente sair da sua conta?"
              onConfirm={confirmLogout}
              onCancel={cancelLogout}
            />

          </div>

        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="navbar mobile-nav">
        <div className="container nav-container">
          <div className="nav-left">
            <button className="hamburger" onClick={toggleMobile} aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}>
              {mobileOpen ? (
                <span className="hamburger-close">✕</span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <Link to="/" className="logo">
              <div className="logo-icon">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="logo-text">Aprenda+</span>
            </Link>
          </div>

          <div className="nav-actions">
            {user ? (
              <Link to="/dashboard">
                <button className="mobile-login-btn">{user.nome || 'Dashboard'}</button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="mobile-login-btn">Login</button>
                </Link>

                <Link to="/register">
                  <button className="mobile-register-btn">Cadastrar</button>
                </Link>
              </>
            )}
          </div>
        </div>

        <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </nav>
    </>
  )
}