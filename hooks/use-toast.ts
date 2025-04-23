import React, { createContext, useCallback, useContext, useRef, useState } from "react";

// Toast Types
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 3000) => {
    const id = toastId.current++;
    setToasts((toasts) => [...toasts, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div style={toastContainerStyle}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ ...toastStyle, ...toastTypeStyles[toast.type] }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.showToast;
}

// Toast container styles
// Toast container styles
const toastContainerStyle: React.CSSProperties = {
  position: "fixed",
  top: 24,
  right: 24,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  pointerEvents: "none",
};

const toastStyle: React.CSSProperties = {
  minWidth: 220,
  maxWidth: 360,
  padding: "14px 20px",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 500,
  fontSize: 16,
  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
  pointerEvents: "auto",
  transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
  opacity: 0.97,
};

const toastTypeStyles: Record<ToastType, React.CSSProperties> = {
  success: {
    background: "linear-gradient(90deg, #38b000 0%, #70e000 100%)",
  },
  error: {
    background: "linear-gradient(90deg, #d90429 0%, #ef233c 100%)",
  },
  info: {
    background: "linear-gradient(90deg, #4361ee 0%, #48bfe3 100%)",
  },
  warning: {
    background: "linear-gradient(90deg, #ffb100 0%, #ffd60a 100%)",
    color: "#222",
  },
};

const toastStyle: React.CSSProperties = {
  minWidth: 220,
  maxWidth: 360,
  padding: "14px 20px",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 500,
  fontSize: 16,
  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
  pointerEvents: "auto",
  transition: "all 0.3s cubic-bezier(.4,2,.6,1)",
  opacity: 0.97,
};

const toastTypeStyles: Record<ToastType, React.CSSProperties> = {
  success: {
    background: "linear-gradient(90deg, #38b000 0%, #70e000 100%)",
  },
  error: {
    background: "linear-gradient(90deg, #d90429 0%, #ef233c 100%)",
  },
  info: {
    background: "linear-gradient(90deg, #4361ee 0%, #48bfe3 100%)",
  },
  warning: {
    background: "linear-gradient(90deg, #ffb100 0%, #ffd60a 100%)",
    color: "#222",
  },
};

// Usage:
// 1. Wrap your app with <ToastProvider>
// 2. Use const toast = useToast(); toast('Hello', 'success');
