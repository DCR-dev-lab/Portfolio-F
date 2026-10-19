/**
 * Tiny shared registry (plain module, no React state) between <ParticleHeading> and <ParticleStage>.
 * Headings register their DOM box + text; the stage reads the list every frame.
 */
const entries = new Set();
const listeners = new Set();
let status = "pending"; // "pending" | "ready" | "failed"
let uid = 0;

export const registerHeading = (cfg) => {
  const entry = { id: ++uid, ...cfg };
  entries.add(entry);
  return () => entries.delete(entry);
};
export const getEntries = () => entries;

export const setStatus = (next) => {
  if (status === next) return;
  status = next;
  listeners.forEach((l) => l());
};
export const getStatus = () => status;
export const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
