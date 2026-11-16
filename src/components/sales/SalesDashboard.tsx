"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { ADMIN_ID } from "@/data/salesData";
import { resetDemo, setCurrentUser, useSalesState } from "./salesStore";
import { AdminView } from "./AdminView";
import { RepView } from "./RepView";
import { RepAvatar } from "./ui";

export function SalesDashboard() {
  const state = useSalesState();

  if (!state) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 text-slate-500" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Loading dashboard…
      </div>
    );
  }

  const isAdmin = state.currentUserId === ADMIN_ID;
  const currentRep = state.reps.find((r) => r.id === state.currentUserId);
  // If the selected rep was removed, fall back to admin.
  const showAdmin = isAdmin || !currentRep;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Estimator
          </Link>
          <div className="mr-auto">
            <p className="text-base font-bold leading-tight">
              RoofCraft <span className="text-sky-600">Sales</span>
            </p>
            <p className="text-xs text-slate-500">{showAdmin ? "Admin · Lead distribution" : "My call list"}</p>
          </div>

          <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 sm:inline">
            Prototype
          </span>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Viewing as</span>
            <span className="relative inline-flex items-center">
              <span className="pointer-events-none absolute left-2">
                {showAdmin ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white" aria-hidden>
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                ) : (
                  <RepAvatar rep={currentRep} />
                )}
              </span>
              <select
                value={showAdmin ? ADMIN_ID : state.currentUserId}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-1.5 pl-11 pr-8 text-sm font-medium shadow-sm"
              >
                <option value={ADMIN_ID}>Admin</option>
                <optgroup label="Sales reps">
                  {state.reps.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </span>
          </label>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset the demo? All leads, reps and activity will be replaced with sample data.")) resetDemo();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Reset demo data"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span className="hidden md:inline">Reset demo</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
        {showAdmin ? <AdminView state={state} /> : <RepView key={currentRep.id} state={state} />}
      </main>
    </div>
  );
}
