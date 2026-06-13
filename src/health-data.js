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
      sys: NUM(/(?:Blood pressure|BP)[^\d]*(\d{2,3})\/\d{2,3}/i, text),
    },
    meds: [...text.matchAll(/(?:Amlodipine|Paracetamol|Cefixime|Metformin|Vitamin D3|Cetirizine|Omeprazole|Ibuprofen)[^\n.,]*/gi)].map((m) => m[0].trim()),
    text,
  };
}

export function loadFamily(dirs = ["data/sample", "data/records"]) {
  const docs = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".txt"))) {
      docs.push(parseDoc(f, readFileSync(join(dir, f), "utf8")));
    }
  }

  const members = {};
  for (const d of docs) {
    const m = (members[d.patient] ??= { name: d.patient, relation: "family", series: {}, meds: new Set(), docs: 0 });
    m.docs++;
    if (d.relation === "self") m.relation = "self";
    d.meds.forEach((x) => m.meds.add(x));
    for (const [k, v] of Object.entries(d.vitals)) {
      if (v == null || !d.date) continue;
      (m.series[k] ??= []).push({ date: d.date, value: v });
    }
  }
  // Sort each series by date.
  for (const m of Object.values(members)) {
    for (const k of Object.keys(m.series)) m.series[k].sort((a, b) => a.date.localeCompare(b.date));
    m.meds = [...m.meds];
  }
  return members;
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
