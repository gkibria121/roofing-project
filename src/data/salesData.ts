// Sales dashboard prototype — types, lead categories and demo seed data.

export type LeadStatusId =
  | "new"
  | "no_answer"
  | "callback"
  | "appointment"
  | "unresponsive"
  | "not_interested"
  | "wrong_number"
  | "sold";

export interface LeadStatus {
  id: LeadStatusId;
  label: string;
  description: string;
  /** Open = the rep still needs to work this lead. */
  open: boolean;
  /** Whether logging this outcome asks for a date/time. */
  dateLabel?: string;
  badgeClass: string;
  dotClass: string;
}

export const LEAD_STATUSES: LeadStatus[] = [
  {
    id: "new",
    label: "New",
    description: "Not contacted yet",
    open: true,
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
    dotClass: "bg-sky-500",
  },
  {
    id: "no_answer",
    label: "No Answer",
    description: "Called but didn't pick up — try again",
    open: true,
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-200",
    dotClass: "bg-amber-500",
  },
  {
    id: "callback",
    label: "Call Back",
    description: "Asked to be called at a later time",
    open: true,
    dateLabel: "Call back on",
    badgeClass: "bg-violet-50 text-violet-700 ring-violet-200",
    dotClass: "bg-violet-500",
  },
  {
    id: "appointment",
    label: "Appointment Scheduled",
    description: "Inspection / estimate appointment booked",
    open: false,
    dateLabel: "Appointment on",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dotClass: "bg-emerald-500",
  },
  {
    id: "unresponsive",
    label: "Unresponsive",
    description: "Multiple attempts with no response",
    open: false,
    badgeClass: "bg-orange-50 text-orange-700 ring-orange-200",
    dotClass: "bg-orange-500",
  },
  {
    id: "not_interested",
    label: "Not Interested",
    description: "Declined — do not pursue",
    open: false,
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-200",
    dotClass: "bg-rose-500",
  },
  {
    id: "wrong_number",
    label: "Wrong Number",
    description: "Invalid or incorrect contact info",
    open: false,
    badgeClass: "bg-slate-100 text-slate-600 ring-slate-200",
    dotClass: "bg-slate-400",
  },
  {
    id: "sold",
    label: "Sold",
    description: "Customer signed the contract",
    open: false,
    badgeClass: "bg-green-100 text-green-800 ring-green-300",
    dotClass: "bg-green-600",
  },
];

export const STATUS_BY_ID = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.id, s])
) as Record<LeadStatusId, LeadStatus>;

export const LEAD_SOURCES = [
  "Website estimate",
  "Referral",
  "Door knock",
  "Storm canvass",
  "Facebook ad",
  "Google ad",
  "Other",
] as const;

export interface SalesRep {
  id: string;
  name: string;
  /** Tailwind classes for the avatar chip. */
  colorClass: string;
}

export interface LeadActivity {
  at: string; // ISO timestamp
  by: string; // "admin" or rep id
  text: string;
  /** Set when this entry is a logged call outcome — powers analytics. */
  outcome?: LeadStatusId;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  notes: string;
  assignedTo: string | null;
  status: LeadStatusId;
  /** Call-back or appointment date (datetime-local string). */
  scheduledFor: string | null;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  activity: LeadActivity[];
}

export interface SalesState {
  version: 1;
  currentUserId: string; // "admin" or a rep id
  reps: SalesRep[];
  leads: Lead[];
}

export const ADMIN_ID = "admin";

export const REP_COLORS = [
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-teal-100 text-teal-800",
  "bg-indigo-100 text-indigo-800",
  "bg-lime-100 text-lime-800",
];

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Normalised phone used for duplicate detection (last 10 digits). */
export function phoneKey(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

// ---------------------------------------------------------------------------
// Demo seed data
// ---------------------------------------------------------------------------

const SEED_REPS: SalesRep[] = [
  { id: "rep-sarah", name: "Sarah Johnson", colorClass: REP_COLORS[0] },
  { id: "rep-mike", name: "Mike Chen", colorClass: REP_COLORS[1] },
  { id: "rep-priya", name: "Priya Patel", colorClass: REP_COLORS[2] },
  { id: "rep-david", name: "David Brooks", colorClass: REP_COLORS[3] },
];

type SeedRow = [
  name: string,
  phone: string,
  address: string,
  source: string,
  assignedTo: string | null,
  status: LeadStatusId,
  attempts: number,
  notes: string,
  scheduledFor?: string,
];

const SEED_ROWS: SeedRow[] = [
  ["James Whitaker", "(415) 555-0132", "122 Oak St, Daly City, CA", "Website estimate", null, "new", 0, "Requested asphalt shingle quote, ~1,800 sq ft."],
  ["Linda Morales", "(415) 555-0178", "48 Pine Ave, San Bruno, CA", "Storm canvass", null, "new", 0, "Visible wind damage on north slope."],
  ["Robert Kim", "(650) 555-0119", "9 Elm Ct, Pacifica, CA", "Referral", null, "new", 0, "Referred by the Garcias."],
  ["Angela Foster", "(650) 555-0144", "301 Bay Rd, Millbrae, CA", "Facebook ad", null, "new", 0, ""],
  ["Thomas Nguyen", "(415) 555-0190", "77 Hill Dr, Colma, CA", "Google ad", null, "new", 0, "Interested in metal roofing."],
  ["Karen Phillips", "(650) 555-0107", "15 Cedar Ln, Burlingame, CA", "Door knock", null, "new", 0, ""],
  ["Daniel Ortiz", "(415) 555-0163", "540 Mission St, Daly City, CA", "Website estimate", "rep-sarah", "new", 0, "Leak over garage."],
  ["Michelle Carter", "(650) 555-0125", "88 Sunset Blvd, Pacifica, CA", "Referral", "rep-sarah", "appointment", 1, "Free inspection booked.", "2026-11-19T10:00"],
  ["Steven Hall", "(415) 555-0151", "20 Ridge Way, South SF, CA", "Storm canvass", "rep-sarah", "no_answer", 1, ""],
  ["Patricia Young", "(650) 555-0186", "6 Willow Pl, San Mateo, CA", "Google ad", "rep-mike", "callback", 1, "Call after 5pm, husband decides.", "2026-11-17T17:30"],
  ["Brian Lewis", "(415) 555-0112", "410 Grand Ave, South SF, CA", "Door knock", "rep-mike", "new", 0, ""],
  ["Nancy Walker", "(650) 555-0174", "31 Maple St, Belmont, CA", "Facebook ad", "rep-mike", "unresponsive", 3, "3 attempts, voicemail full."],
  ["George Allen", "(415) 555-0139", "199 Shore Dr, Brisbane, CA", "Website estimate", "rep-priya", "sold", 2, "Signed for full tear-off + architectural shingles."],
  ["Sandra Wright", "(650) 555-0158", "72 Vista Ct, Foster City, CA", "Referral", "rep-priya", "new", 0, ""],
  ["Kevin Scott", "(415) 555-0101", "5 Lake St, Daly City, CA", "Storm canvass", "rep-priya", "not_interested", 1, "Already hired another contractor."],
  ["Laura Green", "(650) 555-0195", "260 Park Ave, Redwood City, CA", "Google ad", "rep-david", "new", 0, "Wants solar-ready roof."],
  ["Mark Adams", "(415) 555-0147", "13 Bridge Rd, San Bruno, CA", "Door knock", "rep-david", "wrong_number", 1, ""],
  // --- Unassigned pool ---
  ["Rachel Turner", "(415) 555-0210", "402 Alemany Blvd, San Francisco, CA", "Website estimate", null, "new", 0, "Roof is 22 years old, wants full replacement."],
  ["Christopher Diaz", "(650) 555-0211", "18 Magnolia Dr, San Mateo, CA", "Storm canvass", null, "new", 0, "Missing shingles after last week's storm."],
  ["Emily Robinson", "(415) 555-0212", "77 Westlake Ave, Daly City, CA", "Facebook ad", null, "new", 0, ""],
  ["Joshua Martinez", "(650) 555-0213", "1250 Hillside Blvd, Colma, CA", "Google ad", null, "new", 0, "Asked about financing options."],
  ["Ashley Thompson", "(650) 555-0214", "9 Seaview Ter, Pacifica, CA", "Referral", null, "new", 0, "Neighbor of Michelle Carter."],
  ["Andrew White", "(415) 555-0215", "300 Gellert Blvd, Daly City, CA", "Door knock", null, "new", 0, "Flat roof section leaking."],
  ["Jessica Harris", "(650) 555-0216", "64 Laurel St, San Carlos, CA", "Website estimate", null, "new", 0, "Wants tile roof quote."],
  ["Ryan Clark", "(650) 555-0217", "211 Old County Rd, Belmont, CA", "Google ad", null, "new", 0, ""],
  ["Megan Lewis", "(415) 555-0218", "45 San Pedro Rd, Daly City, CA", "Storm canvass", null, "new", 0, "Gutter damage too."],
  ["Justin Walker", "(650) 555-0219", "800 Ralston Ave, Belmont, CA", "Facebook ad", null, "new", 0, ""],
  ["Amanda Young", "(650) 555-0220", "27 Bayshore Cir, San Bruno, CA", "Referral", null, "new", 0, "Referred by George Allen."],
  ["Brandon King", "(415) 555-0221", "150 Skyline Blvd, Brisbane, CA", "Door knock", null, "new", 0, "Interested in skylights."],
  ["Stephanie Wright", "(650) 555-0222", "5 Edgewood Rd, Redwood City, CA", "Website estimate", null, "new", 0, "Insurance claim in progress."],
  ["Tyler Lopez", "(650) 555-0223", "390 Hickey Blvd, South SF, CA", "Google ad", null, "new", 0, ""],
  // --- Sarah ---
  ["Nicole Hill", "(415) 555-0224", "22 Crocker Ave, Daly City, CA", "Website estimate", "rep-sarah", "new", 0, "Prefers texts before calls."],
  ["Eric Scott", "(650) 555-0225", "618 Linden Ave, South SF, CA", "Storm canvass", "rep-sarah", "callback", 1, "Wants call after getting insurance adjuster report.", "2026-11-18T11:00"],
  ["Rebecca Green", "(650) 555-0226", "71 Canyon Dr, Pacifica, CA", "Referral", "rep-sarah", "sold", 2, "Signed — standing seam metal."],
  ["Jacob Baker", "(415) 555-0227", "940 Southgate Ave, Daly City, CA", "Door knock", "rep-sarah", "no_answer", 2, ""],
  // --- Mike ---
  ["Samantha Nelson", "(650) 555-0228", "33 Elm St, San Carlos, CA", "Facebook ad", "rep-mike", "new", 0, ""],
  ["Nathan Carter", "(415) 555-0229", "210 Bellevue Ave, Daly City, CA", "Website estimate", "rep-mike", "appointment", 1, "Estimate visit with both owners.", "2026-11-20T14:00"],
  ["Hannah Mitchell", "(650) 555-0230", "88 Arroyo Dr, South SF, CA", "Google ad", "rep-mike", "no_answer", 1, "Left voicemail."],
  ["Zachary Perez", "(650) 555-0231", "4 Monte Vista Dr, San Bruno, CA", "Door knock", "rep-mike", "not_interested", 1, "Renting — not the owner."],
  // --- Priya ---
  ["Olivia Roberts", "(415) 555-0232", "57 Lakeshore Dr, Daly City, CA", "Referral", "rep-priya", "appointment", 1, "Inspection + gutter quote.", "2026-11-18T09:30"],
  ["Dylan Turner", "(650) 555-0233", "320 Woodside Rd, Redwood City, CA", "Website estimate", "rep-priya", "new", 0, "Two-story, steep pitch."],
  ["Lauren Phillips", "(650) 555-0234", "15 Shelter Creek Ln, San Bruno, CA", "Storm canvass", "rep-priya", "callback", 1, "At work until 6pm.", "2026-11-16T18:30"],
  ["Austin Campbell", "(415) 555-0235", "700 Gateway Blvd, South SF, CA", "Google ad", "rep-priya", "unresponsive", 4, "4 attempts across two weeks."],
  // --- David ---
  ["Victoria Parker", "(650) 555-0236", "26 Hillcrest Dr, Millbrae, CA", "Facebook ad", "rep-david", "new", 0, ""],
  ["Kyle Evans", "(415) 555-0237", "512 Brunswick St, Daly City, CA", "Door knock", "rep-david", "no_answer", 1, ""],
  ["Brittany Edwards", "(650) 555-0238", "93 Crystal Springs Rd, San Mateo, CA", "Referral", "rep-david", "appointment", 2, "Wants to compare 3 shingle colors.", "2026-11-21T16:00"],
  ["Sean Collins", "(650) 555-0239", "140 Lomita Ave, Millbrae, CA", "Website estimate", "rep-david", "callback", 1, "Call back next week — traveling.", "2026-11-23T10:00"],
  ["Christina Stewart", "(415) 555-0240", "8 Ocean View Dr, Pacifica, CA", "Storm canvass", "rep-david", "new", 0, "Chimney flashing issue."],
];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Builds demo data relative to "now" so the analytics charts always have recent
 * history. Only ever called in the browser (the dashboard is client-rendered).
 */
export function createSeedState(): SalesState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = today.getTime();
  const at = (daysAgo: number, hour: number) => new Date(base - daysAgo * DAY + hour * HOUR).toISOString();

  const leads: Lead[] = SEED_ROWS.map((row, i) => {
    const [name, phone, address, source, assignedTo, status, attempts, notes, scheduledFor] = row;
    // Deterministic spread: leads arrive over the last ~2 weeks, calls follow afterwards.
    const createdDaysAgo = 13 - (i % 6);
    const createdAt = at(createdDaysAgo, 8 + (i % 3));
    const events: LeadActivity[] = [{ at: createdAt, by: ADMIN_ID, text: "Lead created" }];

    if (assignedTo) {
      const rep = SEED_REPS.find((r) => r.id === assignedTo)!;
      events.push({ at: at(createdDaysAgo, 10), by: ADMIN_ID, text: `Assigned to ${rep.name}` });
      if (status !== "new") {
        // Final outcome lands somewhere in the last 0–9 days; earlier attempts were missed calls.
        const finalDaysAgo = (i * 7) % 10;
        for (let a = attempts - 1; a >= 1; a--) {
          const daysAgo = Math.min(createdDaysAgo - 1, finalDaysAgo + a * 2);
          events.push({ at: at(daysAgo, 11 + ((i + a) % 6)), by: assignedTo, text: "Marked as No Answer", outcome: "no_answer" });
        }
        const when = scheduledFor ? ` (${scheduledFor.replace("T", " ")})` : "";
        events.push({
          at: at(finalDaysAgo, 12 + (i % 6)),
          by: assignedTo,
          text: `Marked as ${STATUS_BY_ID[status].label}${when}${notes ? ` — ${notes}` : ""}`,
          outcome: status,
        });
      }
    }

    events.sort((a, b) => a.at.localeCompare(b.at));
    return {
      id: `lead-seed-${i + 1}`,
      name,
      phone,
      email: `${name.split(" ")[0]!.toLowerCase()}@example.com`,
      address,
      source,
      notes,
      assignedTo,
      status,
      scheduledFor: scheduledFor ?? null,
      attempts,
      createdAt,
      updatedAt: events[events.length - 1]!.at,
      activity: events.reverse(), // newest first, like the live store
    };
  });

  return { version: 1, currentUserId: ADMIN_ID, reps: SEED_REPS, leads };
}
