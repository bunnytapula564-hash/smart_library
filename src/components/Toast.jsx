import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`} role={toast.type === "error" ? "alert" : "status"} key={toast.id}>
      <span>{toast.text}</span>
      <button onClick={onClose} aria-label="Dismiss message">×</button>
    </div>
  );
}
