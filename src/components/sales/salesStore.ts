"use client";

import { useSyncExternalStore } from "react";
import {
  ADMIN_ID,
  createSeedState,
  Lead,
  LeadStatusId,
  phoneKey,
  REP_COLORS,
  SalesState,
  STATUS_BY_ID,
} from "@/data/salesData";

/**
 * Tiny client-side store for the sales prototype.
 * State lives in localStorage so the demo survives reloads — swap this file
 * for real API calls when the dashboard moves past the prototype stage.
 */

const STORAGE_KEY = "roofcraft-sales-dashboard-v3";

let state: SalesState | null = null;
const listeners = new Set<() => void>();

function load(): SalesState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SalesState;
      if (parsed?.version === 1 && Array.isArray(parsed.leads)) return parsed;
    }
  } catch {
    // Corrupt storage — fall back to seed data.
  }
  return createSeedState();
}

function getSnapshot(): SalesState {
  if (!state) state = load();
  return state;
}

/** During SSR / hydration we render a loading shell instead of guessing state. */
function getServerSnapshot(): SalesState | null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    // Keep multiple tabs (e.g. admin + rep side by side) in sync.
    if (e.key === STORAGE_KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setState(updater: (prev: SalesState) => SalesState) {
  state = updater(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full / disabled — keep working in memory.
  }
  listeners.forEach((l) => l());
}

export function useSalesState(): SalesState | null {
  return useSyncExternalStore<SalesState | null>(subscribe, getSnapshot, getServerSnapshot);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = () => new Date().toISOString();
const newId = (prefix: string) =>
  `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;

function actorName(s: SalesState, id: string) {
  if (id === ADMIN_ID) return "Admin";
  return s.reps.find((r) => r.id === id)?.name ?? "Unknown";
}

function withActivity(
  lead: Lead,
  by: string,
  text: string,
  patch: Partial<Lead> = {},
  outcome?: LeadStatusId
): Lead {
  const at = now();
  return {
    ...lead,
    ...patch,
    updatedAt: at,
    activity: [{ at, by, text, outcome }, ...lead.activity],
  };
}

export function repName(s: SalesState, id: string | null) {
  if (!id) return "Unassigned";
  return actorName(s, id);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export interface NewLeadInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  source?: string;
  notes?: string;
}

/** Adds leads, skipping any whose phone number already exists. */
export function addLeads(inputs: NewLeadInput[], assignTo: string | null = null) {
  const ids: string[] = [];
  const duplicates: string[] = [];
  setState((s) => {
    const seen = new Set(s.leads.map((l) => phoneKey(l.phone)).filter(Boolean));
    const created: Lead[] = [];
    for (const input of inputs) {
      const key = phoneKey(input.phone);
      if (key && seen.has(key)) {
        duplicates.push(input.name || input.phone);
        continue;
      }
      if (key) seen.add(key);
      const at = now();
      const activity = [{ at, by: ADMIN_ID, text: "Lead created" }];
      if (assignTo) activity.unshift({ at, by: ADMIN_ID, text: `Assigned to ${actorName(s, assignTo)}` });
      created.push({
        id: newId("lead"),
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() ?? "",
        address: input.address?.trim() ?? "",
        source: input.source?.trim() || "Other",
        notes: input.notes?.trim() ?? "",
        assignedTo: assignTo,
        status: "new",
        scheduledFor: null,
        attempts: 0,
        createdAt: at,
        updatedAt: at,
        activity,
      });
    }
    ids.push(...created.map((l) => l.id));
    return { ...s, leads: [...created, ...s.leads] };
  });
  return { added: ids.length, ids, duplicates };
}

/** Assigns (or unassigns with null) leads. A lead only ever has one owner. */
export function assignLeads(ids: string[], repId: string | null) {
  const idSet = new Set(ids);
  setState((s) => ({
    ...s,
    leads: s.leads.map((l) => {
      if (!idSet.has(l.id) || l.assignedTo === repId) return l;
      const text = repId
        ? l.assignedTo
          ? `Reassigned from ${actorName(s, l.assignedTo)} to ${actorName(s, repId)}`
          : `Assigned to ${actorName(s, repId)}`
        : `Unassigned from ${actorName(s, l.assignedTo!)}`;
      return withActivity(l, ADMIN_ID, text, { assignedTo: repId });
    }),
  }));
}

/**
 * Spreads the given leads across reps, always giving the next lead to the rep
 * with the fewest open leads — keeps workloads balanced and never overlaps.
 */
export function autoDistribute(ids: string[], repIds: string[]) {
  if (!repIds.length || !ids.length) return;
  setState((s) => {
    const load = new Map(repIds.map((id) => [id, 0]));
    for (const l of s.leads) {
      if (l.assignedTo && load.has(l.assignedTo) && STATUS_BY_ID[l.status].open && !ids.includes(l.id)) {
        load.set(l.assignedTo, load.get(l.assignedTo)! + 1);
      }
    }
    const target = new Map<string, string>();
    for (const id of ids) {
      const [repId] = [...load.entries()].sort((a, b) => a[1] - b[1])[0]!;
      target.set(id, repId);
      load.set(repId, load.get(repId)! + 1);
    }
    return {
      ...s,
      leads: s.leads.map((l) => {
        const repId = target.get(l.id);
        if (!repId || repId === l.assignedTo) return l;
        return withActivity(l, ADMIN_ID, `Auto-assigned to ${actorName(s, repId)}`, { assignedTo: repId });
      }),
    };
  });
}

export function deleteLeads(ids: string[]) {
  const idSet = new Set(ids);
  setState((s) => ({ ...s, leads: s.leads.filter((l) => !idSet.has(l.id)) }));
}

/** Logs a call outcome (the rep "puts the lead in a category"). */
export function logOutcome(
  leadId: string,
  by: string,
  status: LeadStatusId,
  note: string,
  scheduledFor: string | null,
  countsAsAttempt = true
) {
  setState((s) => ({
    ...s,
    leads: s.leads.map((l) => {
      if (l.id !== leadId) return l;
      const label = STATUS_BY_ID[status].label;
      const when = scheduledFor ? ` (${formatDateTime(scheduledFor)})` : "";
      const text = `Marked as ${label}${when}${note.trim() ? ` — ${note.trim()}` : ""}`;
      return withActivity(
        l,
        by,
        text,
        {
          status,
          scheduledFor: STATUS_BY_ID[status].dateLabel ? scheduledFor : null,
          attempts: countsAsAttempt ? l.attempts + 1 : l.attempts,
        },
        status
      );
    }),
  }));
}

export function updateLeadDetails(leadId: string, patch: Partial<Pick<Lead, "name" | "phone" | "email" | "address" | "source" | "notes">>) {
  setState((s) => ({
    ...s,
    leads: s.leads.map((l) => (l.id === leadId ? withActivity(l, s.currentUserId, "Details edited", patch) : l)),
  }));
}

export function addRep(name: string) {
  setState((s) => ({
    ...s,
    reps: [
      ...s.reps,
      { id: newId("rep"), name: name.trim(), colorClass: REP_COLORS[s.reps.length % REP_COLORS.length]! },
    ],
  }));
}

/** Removes a rep and returns their leads to the unassigned pool. */
export function removeRep(repId: string) {
  setState((s) => ({
    ...s,
    currentUserId: s.currentUserId === repId ? ADMIN_ID : s.currentUserId,
    reps: s.reps.filter((r) => r.id !== repId),
    leads: s.leads.map((l) =>
      l.assignedTo === repId
        ? withActivity(l, ADMIN_ID, `Returned to pool (${actorName(s, repId)} removed)`, { assignedTo: null })
        : l
    ),
  }));
}

export function setCurrentUser(id: string) {
  setState((s) => ({ ...s, currentUserId: id }));
}

export function resetDemo() {
  setState(() => createSeedState());
}

// ---------------------------------------------------------------------------
// Formatting (client-only — the dashboard never renders on the server)
// ---------------------------------------------------------------------------

const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateTimeFmt.format(d);
}

const relFmt = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function formatRelative(iso: string) {
  const diffSec = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diffSec) >= secs) return relFmt.format(Math.round(diffSec / secs), unit);
  }
  return "just now";
}

/** True when a scheduled call-back/appointment is due within the next hour or overdue. */
export function isDue(scheduledFor: string | null) {
  if (!scheduledFor) return false;
  const t = new Date(scheduledFor).getTime();
  return !Number.isNaN(t) && t - Date.now() < 60 * 60 * 1000;
}
