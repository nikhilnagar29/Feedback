"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);

    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, props.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-md shadow-md transition-all max-w-sm w-full flex gap-2",
              toast.variant === "destructive"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-900 border border-gray-200"
            )}
          >
            <div className="flex-1">
              {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
              {toast.description && <p className="text-sm">{toast.description}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const toast = (props: ToastProps) => {
  console.warn(
    "Direct toast usage without context is not recommended. Use useToast hook inside component instead."
  );
  // Fallback for direct usage
  const toastEl = document.createElement("div");
  toastEl.className = cn(
    "fixed bottom-4 right-4 p-4 rounded-md shadow-md max-w-sm z-50 transition-all",
    props.variant === "destructive"
      ? "bg-red-600 text-white"
      : "bg-white text-gray-900 border border-gray-200"
  );

  const titleEl = document.createElement("h3");
  titleEl.className = "font-semibold";
  titleEl.textContent = props.title || "";

  const descriptionEl = document.createElement("p");
  descriptionEl.className = "text-sm";
  descriptionEl.textContent = props.description || "";

  toastEl.appendChild(titleEl);
  toastEl.appendChild(descriptionEl);
  document.body.appendChild(toastEl);

  setTimeout(() => {
    toastEl.style.opacity = "0";
    setTimeout(() => document.body.removeChild(toastEl), 300);
  }, props.duration || 5000);
}; 