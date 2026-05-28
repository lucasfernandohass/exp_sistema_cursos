import React from "react";

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  if (!visible) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        {title && <h3 className="confirm-title">{title}</h3>}
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-primary" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
