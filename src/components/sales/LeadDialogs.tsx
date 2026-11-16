"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { CalendarClock, FileUp, Mail, MapPin, Phone, PhoneCall, Trash2 } from "lucide-react";
import {
  ADMIN_ID,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LeadStatusId,
  phoneKey,
  SalesState,
  STATUS_BY_ID,
} from "@/data/salesData";
import {
  addLeads,
  assignLeads,
  autoDistribute,
  deleteLeads,
  formatDateTime,
  formatRelative,
  logOutcome,
  NewLeadInput,
  repName,
  updateLeadDetails,
} from "./salesStore";
import { btnDanger, btnPrimary, btnSecondary, inputClass, Modal, RepAvatar, StatusBadge } from "./ui";

const labelClass = "mb-1 block text-sm font-medium text-slate-700";

// ---------------------------------------------------------------------------
// Add single lead (admin)
// ---------------------------------------------------------------------------

export function AddLeadDialog({ open, onClose, state }: { open: boolean; onClose: () => void; state: SalesState }) {
  const [error, setError] = useState("");

  const close = () => {
    setError("");
    onClose();
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const phone = String(data.get("phone") ?? "");
    const existing = state.leads.find((l) => phoneKey(l.phone) === phoneKey(phone));
    if (existing) {
      setError(`This phone number already belongs to “${existing.name}” (${repName(state, existing.assignedTo)}).`);
      return;
    }
    addLeads(
      [
        {
          name: String(data.get("name") ?? ""),
          phone,
          email: String(data.get("email") ?? ""),
          address: String(data.get("address") ?? ""),
          source: String(data.get("source") ?? ""),
          notes: String(data.get("notes") ?? ""),
        },
      ],
      String(data.get("assignTo") ?? "") || null
    );
    close();
  };

  return (
    <Modal open={open} onClose={close} title="Add lead" description="New leads start in the “New” category.">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" onChange={() => error && setError("")}>
        <div className="sm:col-span-2">
          <label htmlFor="lead-name" className={labelClass}>
            Full name *
          </label>
          <input id="lead-name" name="name" required autoComplete="off" className={inputClass} data-autofocus />
        </div>
        <div>
          <label htmlFor="lead-phone" className={labelClass}>
            Phone *
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9()+\-.\s]{7,}"
            title="Enter a valid phone number"
            placeholder="(415) 555-0100"
            autoComplete="off"
            className={inputClass}
            aria-describedby={error ? "lead-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="lead-email" className={labelClass}>
            Email
          </label>
          <input id="lead-email" name="email" type="email" autoComplete="off" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-address" className={labelClass}>
            Property address
          </label>
          <input id="lead-address" name="address" autoComplete="off" className={inputClass} />
        </div>
        <div>
          <label htmlFor="lead-source" className={labelClass}>
            Source
          </label>
          <select id="lead-source" name="source" className={inputClass} defaultValue={LEAD_SOURCES[0]}>
            {LEAD_SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lead-assign" className={labelClass}>
            Assign to
          </label>
          <select id="lead-assign" name="assignTo" className={inputClass} defaultValue="">
            <option value="">Leave unassigned</option>
            {state.reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="lead-notes" className={labelClass}>
            Notes
          </label>
          <textarea id="lead-notes" name="notes" rows={3} className={inputClass} />
        </div>
        {error && (
          <p id="lead-error" role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className={btnSecondary} onClick={close}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            Add lead
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Bulk import (admin) — paste or upload CSV
// ---------------------------------------------------------------------------

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if ((ch === "," || ch === "\t") && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** Columns: name, phone, email, address (extra columns are joined into the address). */
function parseLeads(text: string): NewLeadInput[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines[0] && /name/i.test(lines[0]) && /phone/i.test(lines[0])) lines.shift();
  return lines
    .map(parseCsvLine)
    .filter((cols) => cols[0] && cols[1])
    .map(([name, phone, email = "", ...rest]) => ({
      name: name!,
      phone: phone!,
      email,
      address: rest.filter(Boolean).join(", "),
    }));
}

const SAMPLE_CSV = `name, phone, email, address
Olivia Bennett, (415) 555-0201, olivia@example.com, 14 Lincoln Ave, Daly City, CA
Ethan Rivera, (650) 555-0202, , 820 El Camino Real, San Carlos, CA
Grace Liu, (415) 555-0203, grace@example.com, 3 Harbor Way, Sausalito, CA
Henry Park, (650) 555-0204, henry@example.com, 57 Crestview Dr, San Mateo, CA`;

export function ImportLeadsDialog({ open, onClose, state }: { open: boolean; onClose: () => void; state: SalesState }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState<string>(LEAD_SOURCES[0]);
  const [target, setTarget] = useState<string>("pool"); // "pool" | "auto" | rep id
  const [result, setResult] = useState<{ added: number; duplicates: string[] } | null>(null);

  const parsed = useMemo(() => parseLeads(text), [text]);

  const close = () => {
    setText("");
    setResult(null);
    onClose();
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setText(await file.text());
    e.target.value = "";
  };

  const handleImport = () => {
    const inputs = parsed.map((p) => ({ ...p, source }));
    const assignTo = target === "pool" || target === "auto" ? null : target;
    const res = addLeads(inputs, assignTo);
    if (target === "auto") autoDistribute(res.ids, state.reps.map((r) => r.id));
    setResult(res);
    setText("");
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import leads"
      description="Paste CSV rows or upload a .csv file. Duplicate phone numbers are skipped automatically."
      size="lg"
    >
      <div className="grid gap-4">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label htmlFor="import-text" className="text-sm font-medium text-slate-700">
              Rows — <span className="font-normal text-slate-500">name, phone, email, address</span>
            </label>
            <div className="flex gap-2">
              <button type="button" className="text-sm font-medium text-sky-700 hover:underline" onClick={() => setText(SAMPLE_CSV)}>
                Use sample
              </button>
              <label className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-sky-700 hover:underline">
                <FileUp className="h-4 w-4" aria-hidden />
                Upload CSV
                <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={handleFile} />
              </label>
            </div>
          </div>
          <textarea
            id="import-text"
            data-autofocus
            rows={8}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResult(null);
            }}
            placeholder={SAMPLE_CSV}
            className={`${inputClass} font-mono text-xs`}
          />
          <p className="mt-1 text-xs text-slate-500" aria-live="polite">
            {parsed.length} lead{parsed.length === 1 ? "" : "s"} detected
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="import-source" className={labelClass}>
              Source
            </label>
            <select id="import-source" value={source} onChange={(e) => setSource(e.target.value)} className={inputClass}>
              {LEAD_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="import-target" className={labelClass}>
              After import
            </label>
            <select id="import-target" value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
              <option value="pool">Keep in unassigned pool</option>
              <option value="auto" disabled={!state.reps.length}>
                Auto-distribute evenly across team
              </option>
              <optgroup label="Assign all to">
                {state.reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {result && (
          <div role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Imported <strong>{result.added}</strong> lead{result.added === 1 ? "" : "s"}.
            {result.duplicates.length > 0 && (
              <span className="block text-amber-800">
                Skipped {result.duplicates.length} duplicate{result.duplicates.length === 1 ? "" : "s"}:{" "}
                {result.duplicates.join(", ")}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={close}>
            {result ? "Done" : "Cancel"}
          </button>
          <button type="button" className={btnPrimary} disabled={!parsed.length} onClick={handleImport}>
            Import {parsed.length || ""} lead{parsed.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Log call outcome (rep, or admin override) — puts the lead into a category
// ---------------------------------------------------------------------------

export function OutcomeDialog({
  leadId,
  state,
  onClose,
}: {
  leadId: string | null;
  state: SalesState;
  onClose: () => void;
}) {
  const lead = leadId ? state.leads.find((l) => l.id === leadId) : undefined;
  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title={lead ? `Log outcome — ${lead.name}` : "Log outcome"}
      description={lead ? `${lead.phone} · ${lead.attempts} previous attempt${lead.attempts === 1 ? "" : "s"}` : undefined}
    >
      {lead && <OutcomeForm key={lead.id} leadId={lead.id} initial={lead.status} actor={state.currentUserId} onDone={onClose} />}
    </Modal>
  );
}

function OutcomeForm({
  leadId,
  initial,
  actor,
  onDone,
}: {
  leadId: string;
  initial: LeadStatusId;
  actor: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<LeadStatusId | null>(initial === "new" ? null : initial);
  const [note, setNote] = useState("");
  const [when, setWhen] = useState("");
  const [countAttempt, setCountAttempt] = useState(true);
  const selected = status ? STATUS_BY_ID[status] : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!status) return;
    logOutcome(leadId, actor, status, note, selected?.dateLabel ? when : null, countAttempt);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <fieldset>
        <legend className={labelClass}>Category</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {LEAD_STATUSES.filter((s) => s.id !== "new").map((s, i) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 has-[:checked]:border-sky-500 has-[:checked]:bg-sky-50 has-[:checked]:ring-1 has-[:checked]:ring-sky-500"
            >
              <input
                type="radio"
                name="status"
                value={s.id}
                required
                checked={status === s.id}
                onChange={() => setStatus(s.id)}
                className="mt-0.5 accent-sky-600"
                {...(i === 0 ? { "data-autofocus": true } : {})}
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <span className={`h-2 w-2 rounded-full ${s.dotClass}`} aria-hidden />
                  {s.label}
                </span>
                <span className="block text-xs text-slate-500">{s.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected?.dateLabel && (
        <div>
          <label htmlFor="outcome-when" className={labelClass}>
            {selected.dateLabel} *
          </label>
          <input
            id="outcome-when"
            type="datetime-local"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="outcome-note" className={labelClass}>
          Note
        </label>
        <textarea
          id="outcome-note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened on the call?"
          className={inputClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={countAttempt} onChange={(e) => setCountAttempt(e.target.checked)} className="accent-sky-600" />
        Count this as a call attempt
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" className={btnSecondary} onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className={btnPrimary} disabled={!status}>
          Save outcome
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Lead detail — contact info, assignment, notes and full activity history
// ---------------------------------------------------------------------------

export function LeadDetailDialog({
  leadId,
  state,
  onClose,
  onLogOutcome,
}: {
  leadId: string | null;
  state: SalesState;
  onClose: () => void;
  onLogOutcome: (id: string) => void;
}) {
  const lead = leadId ? state.leads.find((l) => l.id === leadId) : undefined;
  return (
    <Modal open={!!lead} onClose={onClose} title={lead?.name ?? "Lead"} description={lead?.source} size="lg" lightDismiss>
      {lead && <LeadDetailBody key={lead.id} leadId={lead.id} state={state} onClose={onClose} onLogOutcome={onLogOutcome} />}
    </Modal>
  );
}

function LeadDetailBody({
  leadId,
  state,
  onClose,
  onLogOutcome,
}: {
  leadId: string;
  state: SalesState;
  onClose: () => void;
  onLogOutcome: (id: string) => void;
}) {
  const lead = state.leads.find((l) => l.id === leadId)!;
  const isAdmin = state.currentUserId === ADMIN_ID;
  const owner = state.reps.find((r) => r.id === lead.assignedTo);
  const [notes, setNotes] = useState(lead.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={lead.status} />
          <span className="text-xs text-slate-500">
            {lead.attempts} attempt{lead.attempts === 1 ? "" : "s"}
          </span>
        </div>

        <ul className="grid gap-2 text-sm">
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" aria-hidden />
            <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-sky-700 hover:underline">
              {lead.phone}
            </a>
          </li>
          {lead.email && (
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" aria-hidden />
              <a href={`mailto:${lead.email}`} className="text-sky-700 hover:underline">
                {lead.email}
              </a>
            </li>
          )}
          {lead.address && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-slate-400" aria-hidden />
              <span>{lead.address}</span>
            </li>
          )}
          {lead.scheduledFor && (
            <li className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-slate-400" aria-hidden />
              <span>
                {STATUS_BY_ID[lead.status].dateLabel ?? "Scheduled"}: <strong>{formatDateTime(lead.scheduledFor)}</strong>
              </span>
            </li>
          )}
        </ul>

        <div>
          <label htmlFor="detail-assign" className={labelClass}>
            Assigned to
          </label>
          {isAdmin ? (
            <select
              id="detail-assign"
              value={lead.assignedTo ?? ""}
              onChange={(e) => assignLeads([lead.id], e.target.value || null)}
              className={inputClass}
            >
              <option value="">Unassigned (pool)</option>
              {state.reps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <p id="detail-assign" className="flex items-center gap-2 text-sm">
              <RepAvatar rep={owner} /> {owner?.name ?? "Unassigned"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="detail-notes" className={labelClass}>
            Notes
          </label>
          <textarea id="detail-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          {notes !== lead.notes && (
            <button type="button" className={`${btnSecondary} mt-2`} onClick={() => updateLeadDetails(lead.id, { notes })}>
              Save notes
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <button type="button" className={btnPrimary} onClick={() => onLogOutcome(lead.id)}>
            <PhoneCall className="h-4 w-4" aria-hidden />
            Log outcome
          </button>
          {isAdmin &&
            (confirmDelete ? (
              <>
                <button
                  type="button"
                  className={`${btnDanger} bg-rose-600! text-white! hover:bg-rose-700!`}
                  onClick={() => {
                    deleteLeads([lead.id]);
                    onClose();
                  }}
                >
                  Confirm delete
                </button>
                <button type="button" className={btnSecondary} onClick={() => setConfirmDelete(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button type="button" className={btnDanger} onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete
              </button>
            ))}
        </div>
      </div>

      <section aria-labelledby="activity-heading">
        <h3 id="activity-heading" className="mb-2 text-sm font-semibold text-slate-700">
          Activity
        </h3>
        <ol className="relative grid gap-3 border-l border-slate-200 pl-4">
          {lead.activity.map((a, i) => (
            <li key={`${a.at}-${i}`} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300" aria-hidden />
              <p className="text-slate-800">{a.text}</p>
              <p className="text-xs text-slate-500">
                {repName(state, a.by)} · <time dateTime={a.at}>{formatRelative(a.at)}</time>
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
