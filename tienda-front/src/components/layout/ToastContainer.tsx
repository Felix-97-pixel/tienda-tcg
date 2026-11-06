"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { removeToast, Toast, ToastType } from "@/redux/features/toast-slice";
import { useTranslations } from "next-intl";
import {
  IconCheckCircle,
  IconXCircle,
  IconAlertTriangle,
  IconInfo,
  IconX,
} from "@/components/ui/Icons";

const TOAST_DURATION = 3200;

const icons: Record<ToastType, React.ReactNode> = {
  success: <IconCheckCircle className="w-[18px] h-[18px] text-[#22AD5C]" />,
  error: <IconXCircle className="w-[18px] h-[18px] text-[#DC3545]" />,
  warning: <IconAlertTriangle className="w-[18px] h-[18px] text-[#F59E0B]" />,
  info: <IconInfo className="w-[18px] h-[18px] text-[#3C50E0]" />,
};

const borderColors: Record<ToastType, string> = {
  success: "#22AD5C",
  error: "#DC3545",
  warning: "#F59E0B",
  info: "#3C50E0",
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const t = useTranslations("common");
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
          aria-label={t("close")}
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
          <IconX className="w-3 h-3" />
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
  const t = useTranslations("common");
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
      aria-label={t("notifications_aria")}
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
