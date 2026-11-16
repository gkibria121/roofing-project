"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { initials, LeadStatusId, SalesRep, STATUS_BY_ID } from "@/data/salesData";

// ---------------------------------------------------------------------------
// Modal — native <dialog> opened with showModal() so the browser handles
// focus containment, inert background, Esc / back gesture and focus return.
// ---------------------------------------------------------------------------

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Allow click-outside to close. Keep off for forms to avoid losing input. */
  lightDismiss?: boolean;
  size?: "md" | "lg";
  children: ReactNode;
}

export function Modal({ open, onClose, title, description, lightDismiss = false, size = "md", children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // React's autoFocus doesn't render the attribute, so pick the initial field ourselves.
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Light-dismiss fallback for browsers without `closedby` support (Safari).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !lightDismiss || "closedBy" in HTMLDialogElement.prototype) return;
    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    const down = (e: PointerEvent) => (pressedOutside = outside(e));
    const up = (e: PointerEvent) => {
      if (pressedOutside && outside(e)) dialog.close();
    };
    dialog.addEventListener("pointerdown", down);
    dialog.addEventListener("pointerup", up);
    return () => {
      dialog.removeEventListener("pointerdown", down);
      dialog.removeEventListener("pointerup", up);
    };
  }, [lightDismiss]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      {...{ closedby: lightDismiss ? "any" : "closerequest" }}
      className={`sales-dialog m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-[2px] ${
        size === "lg" ? "max-w-3xl" : "max-w-lg"
      }`}
    >
      {open && (
        <>
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </header>
          <div className="px-6 py-5">{children}</div>
        </>
      )}
    </dialog>
  );
}

// ---------------------------------------------------------------------------
// Small display components
// ---------------------------------------------------------------------------

export function StatusBadge({ status }: { status: LeadStatusId }) {
  const s = STATUS_BY_ID[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dotClass}`} aria-hidden />
      {s.label}
    </span>
  );
}

export function RepAvatar({ rep, size = "sm" }: { rep: SalesRep | undefined; size?: "sm" | "md" }) {
  const dims = size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-[11px]";
  if (!rep) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 ${dims}`}
        aria-hidden
      >
        ?
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${rep.colorClass} ${dims}`}
      aria-hidden
    >
      {initials(rep.name)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "text-slate-900",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-sky-500";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50";
