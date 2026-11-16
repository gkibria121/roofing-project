"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  Inbox,
  ListChecks,
  Plus,
  Search,
  Shuffle,
  Trash2,
  Trophy,
  Upload,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { LEAD_STATUSES, LeadStatusId, SalesState, STATUS_BY_ID } from "@/data/salesData";
import { addRep, assignLeads, autoDistribute, deleteLeads, formatRelative, removeRep } from "./salesStore";
import { AddLeadDialog, ImportLeadsDialog, LeadDetailDialog, OutcomeDialog } from "./LeadDialogs";
import { btnDanger, btnPrimary, btnSecondary, inputClass, RepAvatar, StatCard, StatusBadge } from "./ui";
import { SalesAnalytics } from "./SalesAnalytics";

type AssigneeFilter = "all" | "unassigned" | string;

export function AdminView({ state }: { state: SalesState }) {
  const [adminTab, setAdminTab] = useState<"leads" | "analytics">("leads");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatusId | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRep, setBulkRep] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { leads, reps } = state;
  const repById = useMemo(() => new Map(reps.map((r) => [r.id, r])), [reps]);

  // ---- Stats -------------------------------------------------------------
  const stats = useMemo(() => {
    const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, 0])) as Record<LeadStatusId, number>;
    let unassigned = 0;
    let open = 0;
    for (const l of leads) {
      byStatus[l.status]++;
      if (!l.assignedTo) unassigned++;
      if (STATUS_BY_ID[l.status].open) open++;
    }
    const perRep = reps.map((r) => {
      const mine = leads.filter((l) => l.assignedTo === r.id);
      return {
        rep: r,
        total: mine.length,
        open: mine.filter((l) => STATUS_BY_ID[l.status].open).length,
        appointments: mine.filter((l) => l.status === "appointment").length,
        sold: mine.filter((l) => l.status === "sold").length,
      };
    });
    return { byStatus, unassigned, open, perRep };
  }, [leads, reps]);

  // ---- Filtering ---------------------------------------------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (assigneeFilter === "unassigned" && l.assignedTo) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && l.assignedTo !== assigneeFilter) return false;
      if (q && !`${l.name} ${l.phone} ${l.email} ${l.address}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [leads, query, statusFilter, assigneeFilter]);

  // Drop selections that are no longer visible / no longer exist.
  const visibleSelected = useMemo(
    () => new Set(filtered.filter((l) => selected.has(l.id)).map((l) => l.id)),
    [filtered, selected]
  );
  const selectedIds = [...visibleSelected];
  const allVisibleSelected = filtered.length > 0 && visibleSelected.size === filtered.length;
  const selectedAlreadyOwned = selectedIds.filter((id) => {
    const l = leads.find((x) => x.id === id);
    return l?.assignedTo && l.assignedTo !== bulkRep;
  }).length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allVisibleSelected ? new Set() : new Set(filtered.map((l) => l.id)));
  const clearSelection = () => {
    setSelected(new Set());
    setConfirmBulkDelete(false);
  };

  const unassignedOpenIds = leads.filter((l) => !l.assignedTo && STATUS_BY_ID[l.status].open).map((l) => l.id);

  const hasFilters = query || statusFilter !== "all" || assigneeFilter !== "all";

  return (
    <div className="grid gap-6">
      {/* Top View Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={adminTab === "leads"}
            onClick={() => setAdminTab("leads")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all aria-selected:bg-slate-900 aria-selected:text-white text-slate-600 hover:text-slate-900"
          >
            <ListChecks className="h-4 w-4" />
            Leads & Distribution
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              adminTab === "leads" ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
            }`}>
              {leads.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={adminTab === "analytics"}
            onClick={() => setAdminTab("analytics")}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all aria-selected:bg-slate-900 aria-selected:text-white text-slate-600 hover:text-slate-900"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics & Team Performance
          </button>
        </div>

        {adminTab === "leads" ? (
          <button
            type="button"
            onClick={() => setAdminTab("analytics")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            View Full Team & Rep Analytics →
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAdminTab("leads")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:underline"
          >
            <ListChecks className="h-3.5 w-3.5" />
            ← Back to Leads Management
          </button>
        )}
      </div>

      {adminTab === "analytics" ? (
        <SalesAnalytics state={state} />
      ) : (
        <>
          {/* Stats */}
          <section aria-label="Overview" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total leads" value={leads.length} icon={<ListChecks className="h-4 w-4" />} />
        <StatCard
          label="Unassigned"
          value={stats.unassigned}
          hint={stats.unassigned ? "Waiting in the pool" : "Everything is assigned"}
          icon={<Inbox className="h-4 w-4" />}
          accent={stats.unassigned ? "text-amber-600" : "text-slate-900"}
        />
        <StatCard label="In progress" value={stats.open} hint="New, no answer, call back" icon={<Users className="h-4 w-4" />} />
        <StatCard
          label="Appointments"
          value={stats.byStatus.appointment}
          icon={<CalendarCheck className="h-4 w-4" />}
          accent="text-emerald-600"
        />
        <StatCard label="Sold" value={stats.byStatus.sold} icon={<Trophy className="h-4 w-4" />} accent="text-green-700" />
      </section>

      {/* Pipeline by category */}
      <section aria-labelledby="pipeline-heading" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 id="pipeline-heading" className="text-sm font-semibold text-slate-700">
          Pipeline by category
        </h2>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          {LEAD_STATUSES.map((s) =>
            stats.byStatus[s.id] ? (
              <div key={s.id} className={s.dotClass} style={{ width: `${(stats.byStatus[s.id] / Math.max(leads.length, 1)) * 100}%` }} />
            ) : null
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {LEAD_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={statusFilter === s.id}
              onClick={() => setStatusFilter(statusFilter === s.id ? "all" : s.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 aria-pressed:border-sky-500 aria-pressed:bg-sky-50 aria-pressed:text-sky-800"
            >
              <span className={`h-2 w-2 rounded-full ${s.dotClass}`} aria-hidden />
              {s.label}
              <span className="font-semibold tabular-nums">{stats.byStatus[s.id]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* Team */}
        <TeamPanel
          state={state}
          perRep={stats.perRep}
          unassigned={stats.unassigned}
          activeFilter={assigneeFilter}
          onFilter={(f) => setAssigneeFilter(assigneeFilter === f ? "all" : f)}
          onAutoDistribute={() => autoDistribute(unassignedOpenIds, reps.map((r) => r.id))}
          unassignedOpenCount={unassignedOpenIds.length}
        />

        {/* Leads table */}
        <section aria-labelledby="leads-heading" className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
            <h2 id="leads-heading" className="mr-auto text-base font-semibold">
              Leads <span className="font-normal text-slate-500">({filtered.length})</span>
            </h2>
            <button type="button" className={btnSecondary} onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" aria-hidden />
              Import
            </button>
            <button type="button" className={btnPrimary} onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Add lead
            </button>
          </div>

          {/* Filters */}
          <div className="grid gap-2 border-b border-slate-200 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                aria-label="Search leads"
                placeholder="Search name, phone, address…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
              aria-label="Filter by category"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatusId | "all")}
              className={inputClass}
            >
              <option value="all">All categories</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by assignee"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {reps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={btnSecondary}
              disabled={!hasFilters}
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setAssigneeFilter("all");
              }}
            >
              Clear
            </button>
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-sky-200 bg-sky-50 px-4 py-3 text-sm" role="region" aria-label="Bulk actions">
              <span className="font-semibold text-sky-900">{selectedIds.length} selected</span>
              <button type="button" onClick={clearSelection} className="rounded p-1 text-sky-700 hover:bg-sky-100" aria-label="Clear selection">
                <X className="h-4 w-4" aria-hidden />
              </button>
              <span className="mx-1 h-5 w-px bg-sky-200" aria-hidden />
              <select aria-label="Assign selected to" value={bulkRep} onChange={(e) => setBulkRep(e.target.value)} className={`${inputClass} w-auto py-1.5`}>
                <option value="">Assign to…</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`${btnPrimary} py-1.5`}
                disabled={!bulkRep}
                onClick={() => {
                  assignLeads(selectedIds, bulkRep);
                  clearSelection();
                }}
              >
                Assign
              </button>
              <button
                type="button"
                className={`${btnSecondary} py-1.5`}
                disabled={!reps.length}
                onClick={() => {
                  autoDistribute(selectedIds, reps.map((r) => r.id));
                  clearSelection();
                }}
                title="Spread the selected leads evenly across the team, giving more to whoever has fewer open leads"
              >
                <Shuffle className="h-4 w-4" aria-hidden />
                Distribute evenly
              </button>
              <button
                type="button"
                className={`${btnSecondary} py-1.5`}
                onClick={() => {
                  assignLeads(selectedIds, null);
                  clearSelection();
                }}
              >
                <UserMinus className="h-4 w-4" aria-hidden />
                Unassign
              </button>
              {confirmBulkDelete ? (
                <button
                  type="button"
                  className={`${btnDanger} bg-rose-600! py-1.5 text-white! hover:bg-rose-700!`}
                  onClick={() => {
                    deleteLeads(selectedIds);
                    clearSelection();
                  }}
                >
                  Confirm delete {selectedIds.length}
                </button>
              ) : (
                <button type="button" className={`${btnDanger} py-1.5`} onClick={() => setConfirmBulkDelete(true)}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              )}
              {bulkRep && selectedAlreadyOwned > 0 && (
                <p className="basis-full text-xs text-amber-800">
                  {selectedAlreadyOwned} of these lead{selectedAlreadyOwned === 1 ? " is" : "s are"} already assigned to someone else and will be moved —
                  a lead only ever belongs to one rep.
                </p>
              )}
            </div>
          )}

          <div tabIndex={0} role="region" aria-labelledby="leads-caption" className="sales-table-wrap">
            <table className="sales-table w-full text-left text-sm">
              <caption id="leads-caption" className="sr-only">
                Leads, filtered by the controls above
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-12 pl-5 pr-2 py-3 text-center align-middle">
                    <input
                      type="checkbox"
                      aria-label="Select all visible leads"
                      checked={allVisibleSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = visibleSelected.size > 0 && !allVisibleSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer align-middle"
                    />
                  </th>
                  <th scope="col">Lead</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Assigned to</th>
                  <th scope="col">Category</th>
                  <th scope="col" className="text-right">
                    Attempts
                  </th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const rep = l.assignedTo ? repById.get(l.assignedTo) : undefined;
                  return (
                    <tr key={l.id} className={visibleSelected.has(l.id) ? "bg-sky-50/60" : "hover:bg-slate-50"}>
                      <td data-label="Select" className="w-12 pl-5 pr-2 py-3 text-center align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Select ${l.name}`}
                          checked={visibleSelected.has(l.id)}
                          onChange={() => toggle(l.id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer align-middle"
                        />
                      </td>
                      <th scope="row" className="font-normal">
                        <button type="button" onClick={() => setDetailId(l.id)} className="text-left">
                          <span className="block font-medium text-slate-900 hover:text-sky-700 hover:underline">{l.name}</span>
                          <span className="block max-w-[28ch] truncate text-xs text-slate-500">{l.address || l.source}</span>
                        </button>
                      </th>
                      <td data-label="Phone" className="whitespace-nowrap tabular-nums">
                        {l.phone}
                      </td>
                      <td data-label="Assigned to">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <RepAvatar rep={rep} />
                          <select
                            aria-label={`Assign ${l.name}`}
                            value={l.assignedTo ?? ""}
                            onChange={(e) => assignLeads([l.id], e.target.value || null)}
                            className={`rounded-md border border-transparent bg-transparent py-1 pr-1 text-sm hover:border-slate-300 ${
                              rep ? "text-slate-800" : "italic text-slate-400"
                            }`}
                          >
                            <option value="">Unassigned</option>
                            {reps.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </span>
                      </td>
                      <td data-label="Category">
                        <StatusBadge status={l.status} />
                      </td>
                      <td data-label="Attempts" className="text-right tabular-nums">
                        {l.attempts}
                      </td>
                      <td data-label="Updated" className="whitespace-nowrap text-slate-500">
                        <time dateTime={l.updatedAt}>{formatRelative(l.updatedAt)}</time>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="p-10 text-center text-sm text-slate-500">
                {leads.length ? "No leads match these filters." : "No leads yet — add or import some to get started."}
              </p>
            )}
          </div>
        </section>
      </div>
      </>
      )}

      <AddLeadDialog open={addOpen} onClose={() => setAddOpen(false)} state={state} />
      <ImportLeadsDialog open={importOpen} onClose={() => setImportOpen(false)} state={state} />
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

// ---------------------------------------------------------------------------
// Team panel — workload per rep + rep management
// ---------------------------------------------------------------------------

function TeamPanel({
  state,
  perRep,
  unassigned,
  unassignedOpenCount,
  activeFilter,
  onFilter,
  onAutoDistribute,
}: {
  state: SalesState;
  perRep: { rep: SalesState["reps"][number]; total: number; open: number; appointments: number; sold: number }[];
  unassigned: number;
  unassignedOpenCount: number;
  activeFilter: AssigneeFilter;
  onFilter: (f: AssigneeFilter) => void;
  onAutoDistribute: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const maxTotal = Math.max(1, ...perRep.map((p) => p.total));

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("repName") ?? "").trim();
    if (!name) return;
    addRep(name);
    form.reset();
  };

  return (
    <aside aria-labelledby="team-heading" className="grid content-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 id="team-heading" className="text-base font-semibold">
          Sales team
        </h2>
        <span className="text-xs text-slate-500">{state.reps.length} reps</span>
      </div>

      <button
        type="button"
        aria-pressed={activeFilter === "unassigned"}
        onClick={() => onFilter("unassigned")}
        className="flex items-center justify-between rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2.5 text-left text-sm hover:bg-amber-50 aria-pressed:ring-2 aria-pressed:ring-amber-400"
      >
        <span className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-amber-600" aria-hidden />
          Unassigned pool
        </span>
        <span className="font-semibold tabular-nums text-amber-700">{unassigned}</span>
      </button>

      <button
        type="button"
        className={`${btnPrimary} w-full`}
        disabled={!unassignedOpenCount || !state.reps.length}
        onClick={onAutoDistribute}
        title="Give each unassigned lead to the rep with the fewest open leads"
      >
        <Shuffle className="h-4 w-4" aria-hidden />
        Auto-distribute {unassignedOpenCount || ""} unassigned
      </button>

      <ul className="grid gap-2">
        {perRep.map(({ rep, total, open, appointments, sold }) => (
          <li key={rep.id}>
            <div
              className={`rounded-xl border p-3 ${activeFilter === rep.id ? "border-sky-400 bg-sky-50 ring-1 ring-sky-400" : "border-slate-200"}`}
            >
              <div className="flex items-center gap-2.5">
                <RepAvatar rep={rep} size="md" />
                <button
                  type="button"
                  aria-pressed={activeFilter === rep.id}
                  onClick={() => onFilter(rep.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-sm font-medium hover:text-sky-700">{rep.name}</span>
                  <span className="block text-xs text-slate-500">
                    {total} lead{total === 1 ? "" : "s"} · {open} open
                  </span>
                </button>
                {confirmRemove === rep.id ? (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                      onClick={() => {
                        removeRep(rep.id);
                        setConfirmRemove(null);
                        if (activeFilter === rep.id) onFilter(rep.id);
                      }}
                    >
                      Remove
                    </button>
                    <button type="button" className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100" onClick={() => setConfirmRemove(null)}>
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Remove ${rep.name}`}
                    title={`Remove ${rep.name} (their leads return to the pool)`}
                    onClick={() => setConfirmRemove(rep.id)}
                    className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full rounded-full bg-sky-500" style={{ width: `${(total / maxTotal) * 100}%` }} />
              </div>
              <dl className="mt-2 grid grid-cols-3 gap-1 text-center text-xs">
                <div>
                  <dt className="text-slate-500">Open</dt>
                  <dd className="font-semibold tabular-nums">{open}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Appts</dt>
                  <dd className="font-semibold tabular-nums text-emerald-700">{appointments}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sold</dt>
                  <dd className="font-semibold tabular-nums text-green-700">{sold}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2 border-t border-slate-200 pt-4">
        <label htmlFor="new-rep" className="sr-only">
          New rep name
        </label>
        <input id="new-rep" name="repName" required placeholder="New rep name" autoComplete="off" className={inputClass} />
        <button type="submit" className={btnSecondary} aria-label="Add rep">
          <UserPlus className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </aside>
  );
}
