"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  Flame,
  LineChart,
  PhoneCall,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  Lead,
  LeadStatusId,
  SalesState,
  STATUS_BY_ID,
} from "@/data/salesData";
import { formatRelative, repName } from "./salesStore";
import { RepAvatar, StatCard } from "./ui";

export function SalesAnalytics({
  state,
  initialRepId = "all",
}: {
  state: SalesState;
  initialRepId?: string; // "all" or rep.id
}) {
  const [selectedRepId, setSelectedRepId] = useState<string>(initialRepId);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { leads, reps } = state;
  const repById = useMemo(() => new Map(reps.map((r) => [r.id, r])), [reps]);

  // Scope leads to either all team or selected rep
  const scopedLeads = useMemo(() => {
    let list = leads;
    if (selectedRepId !== "all") {
      list = list.filter((l) => l.assignedTo === selectedRepId);
    }
    if (sourceFilter !== "all") {
      list = list.filter((l) => l.source === sourceFilter);
    }
    return list;
  }, [leads, selectedRepId, sourceFilter]);

  // Overall stats for scoped leads
  const metrics = useMemo(() => {
    const total = scopedLeads.length;
    const contacted = scopedLeads.filter((l) => l.attempts > 0).length;
    const appointments = scopedLeads.filter((l) => l.status === "appointment").length;
    const sold = scopedLeads.filter((l) => l.status === "sold").length;
    const unresponsive = scopedLeads.filter((l) => l.status === "unresponsive").length;
    const notInterested = scopedLeads.filter((l) => l.status === "not_interested").length;
    const wrongNumber = scopedLeads.filter((l) => l.status === "wrong_number").length;
    const totalCalls = scopedLeads.reduce((acc, l) => acc + l.attempts, 0);

    const contactRate = total > 0 ? Math.round((contacted / total) * 100) : 0;
    const apptRate = total > 0 ? Math.round((appointments / total) * 100) : 0;
    const closeRate = total > 0 ? Math.round((sold / total) * 100) : 0;
    const avgAttempts = contacted > 0 ? (totalCalls / contacted).toFixed(1) : "0";

    const statusCounts = Object.fromEntries(
      LEAD_STATUSES.map((s) => [s.id, scopedLeads.filter((l) => l.status === s.id).length])
    ) as Record<LeadStatusId, number>;

    return {
      total,
      contacted,
      appointments,
      sold,
      unresponsive,
      notInterested,
      wrongNumber,
      totalCalls,
      contactRate,
      apptRate,
      closeRate,
      avgAttempts,
      statusCounts,
    };
  }, [scopedLeads]);

  // Per-rep comparison performance data
  const repStats = useMemo(() => {
    return reps.map((rep) => {
      const myLeads = leads.filter((l) => l.assignedTo === rep.id);
      const total = myLeads.length;
      const contacted = myLeads.filter((l) => l.attempts > 0).length;
      const appointments = myLeads.filter((l) => l.status === "appointment").length;
      const sold = myLeads.filter((l) => l.status === "sold").length;
      const open = myLeads.filter((l) => STATUS_BY_ID[l.status].open).length;
      const totalCalls = myLeads.reduce((acc, l) => acc + l.attempts, 0);

      const contactRate = total > 0 ? Math.round((contacted / total) * 100) : 0;
      const apptRate = total > 0 ? Math.round((appointments / total) * 100) : 0;
      const closeRate = total > 0 ? Math.round((sold / total) * 100) : 0;

      // Composite efficiency score (appointments*2 + sold*4 + contacted*1)
      const score = appointments * 20 + sold * 50 + contacted * 5;

      const statusBreakdown = Object.fromEntries(
        LEAD_STATUSES.map((s) => [s.id, myLeads.filter((l) => l.status === s.id).length])
      ) as Record<LeadStatusId, number>;

      return {
        rep,
        total,
        open,
        contacted,
        appointments,
        sold,
        totalCalls,
        contactRate,
        apptRate,
        closeRate,
        score,
        statusBreakdown,
      };
    }).sort((a, b) => b.score - a.score);
  }, [leads, reps]);

  // Breakdown by lead source
  const sourcePerformance = useMemo(() => {
    return LEAD_SOURCES.map((source) => {
      const srcLeads = (selectedRepId === "all" ? leads : leads.filter((l) => l.assignedTo === selectedRepId)).filter(
        (l) => l.source === source
      );
      const total = srcLeads.length;
      const appts = srcLeads.filter((l) => l.status === "appointment").length;
      const sold = srcLeads.filter((l) => l.status === "sold").length;
      const apptRate = total > 0 ? Math.round((appts / total) * 100) : 0;
      const closeRate = total > 0 ? Math.round((sold / total) * 100) : 0;
      return {
        source,
        total,
        appts,
        sold,
        apptRate,
        closeRate,
      };
    }).filter((s) => s.total > 0).sort((a, b) => b.total - a.total);
  }, [leads, selectedRepId]);

  // Recent activity logs for the scoped view
  const recentOutcomes = useMemo(() => {
    const list: {
      lead: Lead;
      at: string;
      by: string;
      text: string;
      outcome?: LeadStatusId;
    }[] = [];

    for (const lead of scopedLeads) {
      for (const act of lead.activity) {
        if (act.outcome || act.text.startsWith("Marked as")) {
          list.push({
            lead,
            at: act.at,
            by: act.by,
            text: act.text,
            outcome: act.outcome,
          });
        }
      }
    }

    return list.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  }, [scopedLeads]);

  const activeRep = selectedRepId !== "all" ? repById.get(selectedRepId) : null;

  return (
    <div className="grid gap-6">
      {/* Top Filter Bar: Scope selector & Source filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Analytics scope:</span>
          <button
            type="button"
            aria-pressed={selectedRepId === "all"}
            onClick={() => setSelectedRepId("all")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 aria-pressed:border-sky-500 aria-pressed:bg-sky-50 aria-pressed:text-sky-800"
          >
            <Users className="h-3.5 w-3.5" aria-hidden />
            Entire team ({leads.length} leads)
          </button>
          {reps.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={selectedRepId === r.id}
              onClick={() => setSelectedRepId(r.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 aria-pressed:border-sky-500 aria-pressed:bg-sky-50 aria-pressed:text-sky-800"
            >
              <RepAvatar rep={r} />
              {r.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="source-filter" className="text-xs text-slate-500">
            Source:
          </label>
          <select
            id="source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs shadow-sm"
          >
            <option value="all">All Sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scope Banner if looking at single person */}
      {activeRep && (
        <div className="flex items-center justify-between rounded-xl bg-sky-50 border border-sky-200 p-4">
          <div className="flex items-center gap-3">
            <RepAvatar rep={activeRep} size="md" />
            <div>
              <h2 className="text-base font-bold text-sky-950">
                {activeRep.name}’s Performance Deep Dive
              </h2>
              <p className="text-xs text-sky-700">
                Viewing individual conversion metrics, outcome distribution, and logged activities.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRepId("all")}
            className="text-xs font-semibold text-sky-700 hover:underline"
          >
            Back to Team Overview
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Leads Scoped"
          value={metrics.total}
          hint={`${metrics.contacted} contacted (${metrics.contactRate}%)`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatCard
          label="Total Calls Logged"
          value={metrics.totalCalls}
          hint={`Avg ${metrics.avgAttempts} calls per contacted lead`}
          icon={<PhoneCall className="h-4 w-4" />}
          accent="text-sky-600"
        />
        <StatCard
          label="Appointments Booked"
          value={metrics.appointments}
          hint={`${metrics.apptRate}% booking conversion`}
          icon={<CalendarCheck className="h-4 w-4" />}
          accent="text-emerald-600"
        />
        <StatCard
          label="Closed Deals (Sold)"
          value={metrics.sold}
          hint={`${metrics.closeRate}% close rate`}
          icon={<Trophy className="h-4 w-4" />}
          accent="text-green-700"
        />
      </section>

      {/* Visual Conversion Funnel & Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <section
          aria-labelledby="funnel-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 id="funnel-heading" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-600" />
              Sales Conversion Funnel
            </h3>
            <span className="text-xs text-slate-500">
              {metrics.total > 0 ? "100% of pipeline" : "No leads"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <FunnelBar
              label="1. Total Leads Ingested"
              count={metrics.total}
              percent={100}
              barColor="bg-slate-400"
            />
            <FunnelBar
              label="2. Contacted (≥ 1 call made)"
              count={metrics.contacted}
              percent={metrics.contactRate}
              barColor="bg-sky-500"
            />
            <FunnelBar
              label="3. Appointments Scheduled"
              count={metrics.appointments}
              percent={metrics.apptRate}
              barColor="bg-emerald-500"
            />
            <FunnelBar
              label="4. Closed Won (Sold)"
              count={metrics.sold}
              percent={metrics.closeRate}
              barColor="bg-green-600"
            />
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 flex justify-around text-center">
            <div>
              <span className="block font-bold text-slate-900 text-sm">{metrics.contactRate}%</span>
              Contact Rate
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="block font-bold text-slate-900 text-sm">
                {metrics.contacted > 0 ? Math.round((metrics.appointments / metrics.contacted) * 100) : 0}%
              </span>
              Appt / Contacted
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="block font-bold text-slate-900 text-sm">
                {metrics.appointments > 0 ? Math.round((metrics.sold / metrics.appointments) * 100) : 0}%
              </span>
              Close / Appt
            </div>
          </div>
        </section>

        {/* Outcome Category Distribution */}
        <section
          aria-labelledby="outcomes-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 id="outcomes-heading" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              Outcome Category Distribution
            </h3>
            <span className="text-xs text-slate-500">{metrics.total} leads total</span>
          </div>

          <div className="mt-4 grid gap-2.5">
            {LEAD_STATUSES.map((status) => {
              const count = metrics.statusCounts[status.id];
              const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
              return (
                <div key={status.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                      {status.label}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${status.dotClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Per-Person Performance Leaderboard (shown for all team) */}
      <section
        aria-labelledby="reps-leaderboard-heading"
        className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h3 id="reps-leaderboard-heading" className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              Sales Rep Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by overall sales effectiveness, appointments, and deal closure.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {reps.length} active sales representatives
          </span>
        </div>

        <div tabIndex={0} role="region" aria-label="Sales rep leaderboard" className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th scope="col" className="pl-6 pr-3 py-3 w-12 text-center">Rank</th>
                <th scope="col" className="px-4 py-3">Sales Rep</th>
                <th scope="col" className="px-4 py-3 text-center">Assigned</th>
                <th scope="col" className="px-4 py-3 text-center">Calls Made</th>
                <th scope="col" className="px-4 py-3 text-center">Contact %</th>
                <th scope="col" className="px-4 py-3 text-center">Appointments</th>
                <th scope="col" className="px-4 py-3 text-center">Sold</th>
                <th scope="col" className="px-4 py-3 text-center">Close Rate</th>
                <th scope="col" className="px-4 py-3 text-center">Category Distribution</th>
                <th scope="col" className="pr-6 pl-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {repStats.map((item, idx) => {
                const isSelected = selectedRepId === item.rep.id;
                return (
                  <tr
                    key={item.rep.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-sky-50/70" : ""
                    }`}
                  >
                    <td className="pl-6 pr-3 py-3.5 text-center font-bold text-slate-500">
                      {idx === 0 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs">
                          🥇
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs">
                          🥈
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-900 text-xs">
                          🥉
                        </span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <RepAvatar rep={item.rep} size="md" />
                        <div>
                          <div className="font-semibold">{item.rep.name}</div>
                          <div className="text-xs text-slate-500">{item.open} open to call</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums font-semibold">
                      {item.total}
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-slate-700">
                      {item.totalCalls}
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums">
                      <span className="font-medium text-slate-800">{item.contactRate}%</span>
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        {item.appointments}
                        <span className="text-[10px] font-normal text-emerald-600">({item.apptRate}%)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800 ring-1 ring-green-300">
                        {item.sold}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums font-bold text-green-700">
                      {item.closeRate}%
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="mx-auto flex h-2.5 w-32 overflow-hidden rounded-full bg-slate-100" title="Outcomes breakdown">
                        {LEAD_STATUSES.map((s) => {
                          const count = item.statusBreakdown[s.id];
                          if (!count) return null;
                          return (
                            <div
                              key={s.id}
                              className={s.dotClass}
                              style={{ width: `${(count / Math.max(item.total, 1)) * 100}%` }}
                              title={`${s.label}: ${count}`}
                            />
                          );
                        })}
                      </div>
                    </td>
                    <td className="pr-6 pl-3 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedRepId(selectedRepId === item.rep.id ? "all" : item.rep.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {selectedRepId === item.rep.id ? "Viewing" : "Deep Dive"}
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lead Source Effectiveness & Recent Call Outcomes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Effectiveness */}
        <section
          aria-labelledby="source-perf-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 id="source-perf-heading" className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <LineChart className="h-4 w-4 text-sky-600" />
            Lead Source Effectiveness
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Which lead generation channels produce the highest appointment booking and closure rates.
          </p>

          <div className="space-y-3">
            {sourcePerformance.map((src) => (
              <div key={src.source} className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-800">{src.source}</span>
                  <span className="text-slate-500 tabular-nums">
                    {src.total} lead{src.total === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Appointment Rate</span>
                    <span className="font-bold text-emerald-700 text-sm">{src.apptRate}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">({src.appts} appts)</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px]">Close Rate</span>
                    <span className="font-bold text-green-700 text-sm">{src.closeRate}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">({src.sold} won)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Call Activity & Outcomes */}
        <section
          aria-labelledby="recent-outcomes-heading"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 id="recent-outcomes-heading" className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-emerald-600" />
            Recent Call Activity & Outcomes
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Live stream of calls logged and categories marked by the sales team.
          </p>

          {recentOutcomes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No outcomes logged yet.</p>
          ) : (
            <ol className="relative grid gap-3 border-l border-slate-200 pl-4 text-xs">
              {recentOutcomes.map((item, i) => (
                <li key={`${item.at}-${i}`} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-500" aria-hidden />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{item.lead.name}</span>
                    <time className="text-slate-400" dateTime={item.at}>
                      {formatRelative(item.at)}
                    </time>
                  </div>
                  <p className="text-slate-700 mt-0.5">{item.text}</p>
                  <p className="text-slate-400 mt-0.5">
                    Logged by <strong className="text-slate-600">{repName(state, item.by)}</strong> · Lead Phone: {item.lead.phone}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  percent,
  barColor,
}: {
  label: string;
  count: number;
  percent: number;
  barColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="tabular-nums text-slate-500">
          <strong className="text-slate-900">{count}</strong> ({percent}%)
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
    </div>
  );
}
