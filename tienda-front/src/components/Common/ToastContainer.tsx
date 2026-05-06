"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { removeToast, Toast, ToastType } from "@/redux/features/toast-slice";

const TOAST_DURATION = 3200;

const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9.4375" fill="#22AD5C" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9.4375" fill="#DC3545" />
      <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9.4375" fill="#F59E0B" />
      <path d="M10 6V10.5M10 13.5V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9.4375" fill="#3C50E0" />
      <path d="M10 9V14M10 6.5V7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const borderColors: Record<ToastType, string> = {
  success: "#22AD5C",
  error: "#DC3545",
  warning: "#F59E0B",
  info: "#3C50E0",
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Schedule auto-removal
    timerRef.current = setTimeout(() => {
      dismiss();
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  const dismiss = () => {
    if (!cardRef.current) {
      onRemove(toast.id);
      return;
    }
    cardRef.current.style.animation = "toastSlideOut 0.3s ease forwards";
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      ref={cardRef}
      role="alert"
      aria-live="polite"
      style={{
        animation: "toastSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        borderLeft: `4px solid ${borderColors[toast.type]}`,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        minWidth: "280px",
        maxWidth: "360px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Content row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px 10px 14px" }}>
        <span style={{ flexShrink: 0, lineHeight: 0 }}>{icons[toast.type]}</span>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 500,
            color: "#1c274c",
            lineHeight: "1.4",
            flex: 1,
          }}
        >
          {toast.message}
        </p>
        <button
          onClick={dismiss}
          aria-label="Cerrar notificación"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "#8d93a5",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            borderRadius: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: "3px", background: "#f0f2f5", margin: "0 0 0 0" }}>
        <div
          style={{
            height: "100%",
            background: borderColors[toast.type],
            animation: `toastProgress ${TOAST_DURATION}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const toasts = useAppSelector((state: any) => state.toastReducer.toasts);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRemove = (id: string) => {
    dispatch(removeToast(id));
  };

  if (!isMounted) return null;

  return (
    <div
      aria-label="Notificaciones"
      style={{
        position: "fixed",
        top: "90px",
        right: "16px",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
        width: "360px",
      }}
    >
      {toasts.map((toast: Toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={toast} onRemove={handleRemove} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
