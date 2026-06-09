import { useEffect } from "react"

export default function Toast({ message, type, visible, onClose }) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast-icon">
        {type === "success" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  )
}
