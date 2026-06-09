"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Portal-based modal used across the OMS prototype.
 * Each open/closed state renders distinctly so it can be captured as a
 * separate Figma frame (closed trigger frame vs. open modal frame).
 */
export function Modal({
  open, onClose, title, subtitle, children, footer, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  const width = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-xl";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-midnight/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} horizon-panel-elevated rounded-3xl p-5 sm:p-6 animate-scale-in max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[20px] font-bold text-midnight">{title}</h2>
            {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-xl border border-midnight-10 p-1.5 text-ink-muted hover:bg-white"><X size={18} /></button>
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-5 flex flex-wrap items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
