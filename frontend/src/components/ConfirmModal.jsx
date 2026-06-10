import { useEffect, useRef } from "react";

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    cancelButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div className="confirm-modal-overlay" onMouseDown={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {title && <h3 id="confirm-modal-title" className="confirm-title">{title}</h3>}
        <p id="confirm-modal-message" className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button ref={cancelButtonRef} className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-primary" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
