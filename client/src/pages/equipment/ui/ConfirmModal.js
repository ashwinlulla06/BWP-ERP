import React, { useEffect } from 'react';
 
export default function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep it',
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);
 
  if (!open) return null;
 
  return (
    <div className="eq-modal-backdrop" onMouseDown={() => !busy && onClose()}>
      <div
        className="eq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eq-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="eq-modal-title" className="eq-modal__title">{title}</h2>
        <div className="eq-modal__body">{children}</div>
        <div className="eq-modal__actions">
          <button type="button" className="eq-btn eq-btn--secondary" onClick={onClose} disabled={busy} autoFocus>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`eq-btn ${danger ? 'eq-btn--danger' : 'eq-btn--primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}