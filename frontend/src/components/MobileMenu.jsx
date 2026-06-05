import { Link } from "react-router-dom"
import { useEffect, useRef } from "react"

export default function MobileMenu({ open, onClose, user, isAdmin, onLogout }) {
  const menuRef = useRef(null)

  function handleLogout() {
    onClose()
    onLogout()
  }

  useEffect(() => {
    const menu = menuRef.current
    if (!open || !menu) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusable = menu.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first) first.focus()

    function onKey(e) {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Tab") {
        if (focusable.length === 0) {
          e.preventDefault()
          return
        }

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  return (
    <>
      <div ref={menuRef} className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-header">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="logo-text">Aprenda+</span>
          </div>

          <button className="close-menu" onClick={onClose} aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {user ? (
          <div className="mobile-user-panel">
            <div className="mobile-user-avatar" aria-hidden="true">
              {user.nome?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="mobile-user-info">
              <strong>{user.nome}</strong>
              <span>{user.email}</span>
              {isAdmin && <em>Administrador</em>}
            </div>
          </div>
        ) : (
          <div className="mobile-auth-actions">
            <Link to="/login" className="mobile-auth-link" onClick={onClose}>
              Login
            </Link>
            <Link to="/register" className="mobile-auth-primary" onClick={onClose}>
              Cadastrar
            </Link>
          </div>
        )}

        <nav className="mobile-menu-links">
          {user ? (
            isAdmin ? (
              <Link to="/admin/cursos" onClick={onClose}>Painel Admin</Link>
            ) : (
              <>
                <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
                <Link to="/matriculados" onClick={onClose}>Meus Cursos</Link>
              </>
            )
          ) : (
            <>
              <a href="/#courses" onClick={onClose}>Cursos</a>
              <a href="/#about" onClick={onClose}>Sobre nós</a>
              <a href="/#contact" onClick={onClose}>Entre em contato</a>
            </>
          )}
        </nav>

        {user && (
          <div className="mobile-menu-footer">
            <button className="mobile-logout-btn" onClick={handleLogout}>
              Sair da conta
            </button>
          </div>
        )}
      </div>

      <div className={`menu-overlay ${open ? "active" : ""}`} onClick={onClose} />
    </>
  )
}
