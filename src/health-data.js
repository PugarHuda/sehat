// Deterministic structured extraction of vitals from the family documents.
// Powers the dashboard (sparklines) and the proactive alerts agent. Parsing is
// rule-based (no LLM) so numbers and trends are exact, never hallucinated — the
// LLM is only used afterwards to phrase an alert in plain language.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const NUM = (re, s) => { const m = re.exec(s); return m ? Number(m[1]) : null; };

// Clinical reference thresholds (educational; not a diagnostic standard).
export const THRESHOLDS = {
  glucose: { warn: 100, high: 126, unit: "mg/dL", label: "Fasting glucose" },
  hba1c: { warn: 5.7, high: 6.5, unit: "%", label: "HbA1c" },
  ldl: { warn: 130, high: 160, unit: "mg/dL", label: "LDL cholesterol" },
  chol: { warn: 200, high: 240, unit: "mg/dL", label: "Total cholesterol" },
  sys: { warn: 130, high: 140, unit: "mmHg", label: "Systolic BP" },
};

function parseDoc(name, text) {
  const date =
    /Date:\s*(\d{4}-\d{2}-\d{2})/.exec(text)?.[1] ??
    /(\d{4}-\d{2}-\d{2})/.exec(text)?.[1] ?? null;
  const patient = /Patient:\s*([A-Za-z]+)/.exec(text)?.[1] ?? /Child:\s*([A-Za-z]+)/.exec(text)?.[1] ?? "Unknown";
  const relation = /Relation:\s*(self|me)/i.test(text) ? "self" : "family";
  return {
    name,
    date,
    patient,
    relation,
    vitals: {
      glucose: NUM(/glucose:\s*(\d+(?:\.\d+)?)/i, text),
      hba1c: NUM(/HbA1?c:\s*(\d+(?:\.\d+)?)/i, text),
      ldl: NUM(/LDL:\s*(\d+(?:\.\d+)?)/i, text),
      chol: NUM(/cholesterol:\s*(\d+(?:\.\d+)?)/i, text),
      // Require a colon so "target < 130/80" advice lines aren't read as readings.
      sys: NUM(/(?:Blood pressure(?: at draw)?|BP):\s*(\d{2,3})\/\d{2,3}/i, text),
    },
    meds: [...text.matchAll(/(?:Amlodipine|Paracetamol|Cefixime|Metformin|Vitamin D3|Cetirizine|Omeprazole|Ibuprofen)[^\n.,]*/gi)].map((m) => m[0].trim()),
    allergies: [
      ...(/Confirmed allergy:\s*([^\n.(]+)/i.exec(text)?.[1] ? [/Confirmed allergy:\s*([^\n.(]+)/i.exec(text)[1].trim()] : []),
      ...(/allergic to ([^\n.(]+)/i.exec(text)?.[1] ? [/allergic to ([^\n.(]+)/i.exec(text)[1].trim()] : []),
      ...(/(\w+)\s+allergy on record/i.exec(text)?.[1] ? [/(\w+)\s+allergy on record/i.exec(text)[1].trim()] : []),
    ],
    diagnosis: /Diagnosis:\s*([^\n]+)/i.exec(text)?.[1]?.trim() ?? null,
    text,
  };
}

function parseAll(dirs) {
  const docs = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".txt"))) {
      docs.push(parseDoc(f, readFileSync(join(dir, f), "utf8")));
    }
  }
  return docs;
}

// Exposed for reminders/emergency card which need raw per-doc text + dates.
export function loadDocs(dirs = ["data/sample", "data/records"]) {
  return parseAll(dirs);
}

export function loadFamily(dirs = ["data/sample", "data/records"]) {
  const docs = parseAll(dirs);
  const members = {};
  for (const d of docs) {
    const m = (members[d.patient] ??= { name: d.patient, relation: "family", series: {}, meds: new Set(), allergies: new Set(), conditions: new Set(), docs: 0 });
    m.docs++;
    if (d.relation === "self") m.relation = "self";
    d.meds.forEach((x) => m.meds.add(x));
    d.allergies.forEach((x) => m.allergies.add(x));
    if (d.diagnosis) m.conditions.add(d.diagnosis);
    for (const [k, v] of Object.entries(d.vitals)) {
      if (v == null || !d.date) continue;
      (m.series[k] ??= []).push({ date: d.date, value: v });
    }
  }
  for (const m of Object.values(members)) {
    for (const k of Object.keys(m.series)) m.series[k].sort((a, b) => a.date.localeCompare(b.date));
    // Dedupe meds by drug name (first word), keeping the most descriptive variant.
    const byDrug = {};
    for (const med of m.meds) {
      const key = med.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ")[0];
      if (!byDrug[key] || med.length > byDrug[key].length) byDrug[key] = med;
    }
    m.meds = Object.values(byDrug);
    m.allergies = [...new Set([...m.allergies].map((a) => a.toLowerCase()))].map((a) => a.charAt(0).toUpperCase() + a.slice(1));
    m.conditions = [...m.conditions];
  }
  return members;
}

// Upcoming reminders parsed from documents: re-tests, follow-ups, vaccine due
// dates, etc. Relative phrases ("re-test in 6 months") are resolved off the
// document date.
function addMonths(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); }
function addWeeks(iso, n) { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n * 7); return d.toISOString().slice(0, 10); }

export function computeReminders(docs, today) {
  const out = [];
  const push = (member, what, due, source) => { if (due) out.push({ member, what, due, source, overdue: due < today }); };
  for (const d of docs) {
    const who = d.patient;
    const base = d.date;
    let m;
    if (base && (m = /Re-?test in (\d+)\s*(month|week)s?/i.exec(d.text)))
      push(who, "Repeat lab panel", m[2].toLowerCase().startsWith("month") ? addMonths(base, +m[1]) : addWeeks(base, +m[1]), d.name);
    if (base && (m = /Re-?evaluate in (\d+)\s*(month|week)s?/i.exec(d.text)))
      push(who, "Follow-up review", m[2].toLowerCase().startsWith("month") ? addMonths(base, +m[1]) : addWeeks(base, +m[1]), d.name);
    if (base && (m = /Return in (\d+)\s*(week|month)s?/i.exec(d.text)))
      push(who, "Return visit", m[2].toLowerCase().startsWith("month") ? addMonths(base, +m[1]) : addWeeks(base, +m[1]), d.name);
    if ((m = /(?:second dose|next dose|booster).*?due\s*(\d{4}-\d{2}-\d{2})/i.exec(d.text))) push(who, "Vaccine dose", m[1], d.name);
    if (/school entry/i.test(d.text) && (m = /\b(20\d{2})\b/.exec(/school entry[^\n]*/i.exec(d.text)?.[0] ?? "")))
      push(who, "MR booster (school entry)", `${m[1]}-01-01`, d.name);
  }
  // De-dupe by member+what+due, soonest first.
  const seen = new Set();
  return out
    .filter((r) => { const k = `${r.member}|${r.what}|${r.due}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => a.due.localeCompare(b.due));
}

// Critical info for an emergency card / QR (per member).
export function emergencyCard(members, name) {
  const m = members[name];
  if (!m) return null;
  const latest = (k) => m.series[k]?.[m.series[k].length - 1]?.value;
  return {
    name,
    allergies: m.allergies,
    conditions: m.conditions,
    medications: m.meds,
    latest: { glucose: latest("glucose"), hba1c: latest("hba1c"), bp: latest("sys") ? `${latest("sys")}/—` : null },
  };
}

// Proactive rule engine: flag threshold crossings and worsening trends.
export function computeAlerts(members) {
  const alerts = [];
  for (const m of Object.values(members)) {
    for (const [key, series] of Object.entries(m.series)) {
      const t = THRESHOLDS[key];
      if (!t || series.length === 0) continue;
      const latest = series[series.length - 1];
      const prev = series.length > 1 ? series[series.length - 2] : null;

      let severity = null;
      if (latest.value >= t.high) severity = "high";
      else if (latest.value >= t.warn) severity = "warn";

      const rising = prev && latest.value > prev.value;
      const crossedWarn = prev && prev.value < t.warn && latest.value >= t.warn;

      if (severity) {
        alerts.push({
          member: m.name,
          metric: t.label,
          value: latest.value,
          unit: t.unit,
          date: latest.date,
          severity,
          trend: prev ? (latest.value - prev.value) : null,
          rising: !!rising,
          crossed: !!crossedWarn,
          series: series.map((p) => p.value),
        });
      }
    }
  }
  // Most severe first, then rising.
  const rank = { high: 0, warn: 1 };
  alerts.sort((a, b) => rank[a.severity] - rank[b.severity] || (b.rising - a.rising));
  return alerts;
}
