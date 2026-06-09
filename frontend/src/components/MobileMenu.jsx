import { Link } from "react-router-dom"
import { useEffect, useRef } from "react"

export default function MobileMenu({ open, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const menu = menuRef.current
    if (!open || !menu) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusable = menu.querySelectorAll("a, button, input, [tabindex]:not([tabindex=\"-1\"])")
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first) first.focus()

    function onKey(e) {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Tab") {
        if (focusable.length === 0) { e.preventDefault(); return }
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 10L12 15L2 10L12 5L22 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 12V16C6 17.5 8 19 12 19C16 19 18 17.5 18 16V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 10V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="logo-text">Aprenda+</span>
          </div>

          <button className="close-menu" onClick={onClose} aria-label="Fechar menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mobile-menu-links">
          <Link to="/cursos" onClick={onClose}>Cursos</Link>
          <Link to="/sobre" onClick={onClose}>Sobre nós</Link>
          <Link to="/contato" onClick={onClose}>Entre em contato</Link>
        </div>
      </div>

      <div className={`menu-overlay ${open ? "active" : ""}`} onClick={onClose} />
    </>
  )
}