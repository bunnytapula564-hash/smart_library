export const LOAN_DAYS = 14;

export const CATEGORIES = [
  "General",
  "Computer Science",
  "Science",
  "Fiction",
  "History",
  "Mathematics",
  "Technology"
];

// One spine colour per category (used on book spines and cards).
export const SPINE_COLORS = {
  General: "#6b7b8c",
  "Computer Science": "#1f6f6b",
  Science: "#3a6ea5",
  Fiction: "#8c2f39",
  History: "#9a6b2f",
  Mathematics: "#5b4b8a",
  Technology: "#2f7d4f"
};
export const spineColor = (category) => SPINE_COLORS[category] || SPINE_COLORS.General;

const pad = (n) => String(n).padStart(2, "0");
function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const todayISO = () => toISODate(new Date());
export function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
export const isOverdue = (loan) => !loan.returnedAt && loan.dueDate < todayISO();
export const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
