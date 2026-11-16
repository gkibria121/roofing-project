"use client";

import { useMemo, useState } from "react";
import {
  AlarmClock,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Phone,
  PhoneCall,
  PhoneMissed,
  Search,
  Trophy,
} from "lucide-react";
import { Lead, LEAD_STATUSES, LeadStatusId, SalesState, STATUS_BY_ID } from "@/data/salesData";
import { formatDateTime, formatRelative, isDue, logOutcome } from "./salesStore";
import { LeadDetailDialog, OutcomeDialog } from "./LeadDialogs";
import { btnPrimary, btnSecondary, inputClass, StatCard, StatusBadge } from "./ui";
import { SalesAnalytics } from "./SalesAnalytics";

type View = "todo" | "done" | "all";

const OPEN_ORDER: Record<string, number> = { callback: 0, new: 1, no_answer: 2 };

function sortTodo(a: Lead, b: Lead) {
  // Due call-backs first, then fresh leads, then retries with the fewest attempts.
  const aDue = a.status === "callback" && isDue(a.scheduledFor) ? 0 : 1;
  const bDue = b.status === "callback" && isDue(b.scheduledFor) ? 0 : 1;
  if (aDue !== bDue) return aDue - bDue;
  const order = (OPEN_ORDER[a.status] ?? 9) - (OPEN_ORDER[b.status] ?? 9);
  if (order) return order;
  if (a.status === "callback") return (a.scheduledFor ?? "").localeCompare(b.scheduledFor ?? "");
  if (a.attempts !== b.attempts) return a.attempts - b.attempts;
  return a.createdAt.localeCompare(b.createdAt);
}

export function RepView({ state }: { state: SalesState }) {
  const me = state.reps.find((r) => r.id === state.currentUserId)!;
  const [repTab, setRepTab] = useState<"queue" | "analytics">("queue");
  const [view, setView] = useState<View>("todo");
  const [statusFilter, setStatusFilter] = useState<LeadStatusId | "all">("all");
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

  // A rep only ever sees the leads assigned to them — no overlap between callers.
  const myLeads = useMemo(() => state.leads.filter((l) => l.assignedTo === me.id), [state.leads, me.id]);

  const counts = useMemo(() => {
    const open = myLeads.filter((l) => STATUS_BY_ID[l.status].open);
    return {
      open: open.length,
      done: myLeads.length - open.length,
      due: open.filter((l) => l.status === "callback" && isDue(l.scheduledFor)).length,
      appointments: myLeads.filter((l) => l.status === "appointment").length,
      sold: myLeads.filter((l) => l.status === "sold").length,
      byStatus: Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, myLeads.filter((l) => l.status === s.id).length])) as Record<
        LeadStatusId,
        number
      >,
    };
  }, [myLeads]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = myLeads.filter((l) => {
      const open = STATUS_BY_ID[l.status].open;
      if (view === "todo" && !open) return false;
      if (view === "done" && open) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (q && !`${l.name} ${l.phone} ${l.address}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return view === "todo" ? list.sort(sortTodo) : list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [myLeads, view, statusFilter, query]);

  const upcoming = useMemo(
    () =>
      myLeads
        .filter((l) => l.status === "appointment" && l.scheduledFor)
        .sort((a, b) => a.scheduledFor!.localeCompare(b.scheduledFor!)),
    [myLeads]
  );

  const chipStatuses = LEAD_STATUSES.filter((s) => (view === "todo" ? s.open : view === "done" ? !s.open : true));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hi {me.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">
            These leads are yours alone — nobody else on the team is calling them. Call in any order, then put each one in a category.
          </p>
        </div>

        {/* Rep view tab switcher */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={repTab === "queue"}
            onClick={() => setRepTab("queue")}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all aria-selected:bg-slate-900 aria-selected:text-white text-slate-600 hover:text-slate-900"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Call Queue
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
              repTab === "queue" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
            }`}>
              {counts.open}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={repTab === "analytics"}
            onClick={() => setRepTab("analytics")}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all aria-selected:bg-slate-900 aria-selected:text-white text-slate-600 hover:text-slate-900"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            My Performance
          </button>
        </div>
      </div>

      {repTab === "analytics" ? (
        <SalesAnalytics state={state} initialRepId={me.id} />
      ) : (
        <>
          <section aria-label="My numbers" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="To call" value={counts.open} hint={`${myLeads.length} assigned in total`} icon={<ClipboardList className="h-4 w-4" />} />
        <StatCard
          label="Call-backs due"
          value={counts.due}
          hint="Overdue or within the hour"
          icon={<AlarmClock className="h-4 w-4" />}
          accent={counts.due ? "text-violet-600" : "text-slate-900"}
        />
        <StatCard label="Appointments" value={counts.appointments} icon={<CalendarCheck className="h-4 w-4" />} accent="text-emerald-600" />
        <StatCard label="Sold" value={counts.sold} icon={<Trophy className="h-4 w-4" />} accent="text-green-700" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <section aria-labelledby="my-leads-heading" className="min-w-0">
          <h2 id="my-leads-heading" className="sr-only">
            My leads
          </h2>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label="Show">
              {(
                [
                  ["todo", `To call (${counts.open})`],
                  ["done", `Completed (${counts.done})`],
                  ["all", `All (${myLeads.length})`],
                ] as [View, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => {
                    setView(v);
                    setStatusFilter("all");
                  }}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                aria-label="Search my leads"
                placeholder="Search my leads…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {chipStatuses.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={statusFilter === s.id}
                onClick={() => setStatusFilter(statusFilter === s.id ? "all" : s.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 aria-pressed:border-sky-500 aria-pressed:bg-sky-50 aria-pressed:text-sky-800"
              >
                <span className={`h-2 w-2 rounded-full ${s.dotClass}`} aria-hidden />
                {s.label}
                <span className="font-semibold tabular-nums">{counts.byStatus[s.id]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" aria-hidden />
              <p className="mt-2 font-medium">{view === "todo" ? "You're all caught up!" : "Nothing here yet."}</p>
              <p className="text-sm text-slate-500">
                {myLeads.length === 0 ? "Your admin hasn't assigned you any leads yet." : "Try a different filter."}
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {visible.map((l) => (
                <LeadCard
                  key={l.id}
                  lead={l}
                  onOpen={() => setDetailId(l.id)}
                  onOutcome={() => setOutcomeId(l.id)}
                  onNoAnswer={() => logOutcome(l.id, me.id, "no_answer", "", null)}
                />
              ))}
            </ul>
          )}
        </section>

        <aside aria-labelledby="upcoming-heading" className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 id="upcoming-heading" className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck className="h-4 w-4 text-emerald-600" aria-hidden />
            Upcoming appointments
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No appointments booked yet.</p>
          ) : (
            <ol className="mt-3 grid gap-2">
              {upcoming.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => setDetailId(l.id)} className="w-full rounded-lg border border-slate-200 p-2.5 text-left hover:bg-slate-50">
                    <span className="block text-sm font-medium">{l.name}</span>
                    <span className="block text-xs text-emerald-700">{formatDateTime(l.scheduledFor!)}</span>
                    {l.address && <span className="block truncate text-xs text-slate-500">{l.address}</span>}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
      </>
      )}

      <LeadDetailDialog
        leadId={outcomeId ? null : detailId}
        state={state}
        onClose={() => setDetailId(null)}
        onLogOutcome={(id) => setOutcomeId(id)}
      />
      <OutcomeDialog leadId={outcomeId} state={state} onClose={() => setOutcomeId(null)} />
    </div>
  );
}

function LeadCard({
  lead,
  onOpen,
  onOutcome,
  onNoAnswer,
}: {
  lead: Lead;
  onOpen: () => void;
  onOutcome: () => void;
  onNoAnswer: () => void;
}) {
  const status = STATUS_BY_ID[lead.status];
  const due = lead.status === "callback" && isDue(lead.scheduledFor);
  return (
    <li
      className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${due ? "border-violet-300 ring-1 ring-violet-300" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="min-w-0 text-left">
          <span className="block truncate font-semibold hover:text-sky-700 hover:underline">{lead.name}</span>
          <span className="block text-xs text-slate-500">
            {lead.source} · {lead.attempts} attempt{lead.attempts === 1 ? "" : "s"}
          </span>
        </button>
        <StatusBadge status={lead.status} />
      </div>

      {lead.address && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          {lead.address}
        </p>
      )}
      {lead.scheduledFor && status.dateLabel && (
        <p className={`mt-1 flex items-center gap-1.5 text-sm ${due ? "font-medium text-violet-700" : "text-slate-600"}`}>
          <AlarmClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {status.dateLabel} {formatDateTime(lead.scheduledFor)}
          {due && " — due now"}
        </p>
      )}
      {lead.notes && <p className="mt-2 line-clamp-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">{lead.notes}</p>}

      <p className="mt-2 text-xs text-slate-400">
        Last update <time dateTime={lead.updatedAt}>{formatRelative(lead.updatedAt)}</time>
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-3">
        <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className={`${btnPrimary} flex-1 bg-emerald-600! hover:bg-emerald-700!`}>
          <Phone className="h-4 w-4" aria-hidden />
          {lead.phone}
        </a>
        {status.open && (
          <button type="button" className={btnSecondary} onClick={onNoAnswer} title="Quick-log a missed call">
            <PhoneMissed className="h-4 w-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">No answer</span>
          </button>
        )}
        <button type="button" className={btnSecondary} onClick={onOutcome}>
          {status.open ? "Log outcome" : "Update"}
        </button>
      </div>
    </li>
  );
}
