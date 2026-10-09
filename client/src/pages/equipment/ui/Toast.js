import React, { useCallback, useRef, useState } from 'react';
import Icon from './Icon';
 
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
 
  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);
 
  const push = useCallback(
    (message, type = 'info') => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );
 
  return { toasts, push, dismiss };
}
 
const ICONS = { success: 'check_circle', error: 'error', info: 'info' };
 
export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="eq-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`eq-toast eq-toast--${t.type}`}>
          <Icon name={ICONS[t.type] || 'info'} filled />
          <span>{t.message}</span>
          <button type="button" className="eq-toast__close" aria-label="Dismiss message" onClick={() => onDismiss(t.id)}>
            <Icon name="close" size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}