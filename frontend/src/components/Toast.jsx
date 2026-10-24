import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context.toast;
}

function ToastViewport({ toasts, dismiss }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      {toasts.map((item) => (
        <div className={`toast toast-${item.type}`} key={item.id} role={item.type === 'error' ? 'alert' : 'status'}>
          <span className="toast-mark" aria-hidden="true">{item.type === 'error' ? '!' : '✓'}</span>
          <span>{item.message}</span>
          <button className="toast-close" type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
