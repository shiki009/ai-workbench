const STORAGE_KEY = 'vfc-recent-urls';
const MAX = 5;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function save(urls) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  } catch {}
}

export function useRecentUrls() {
  const add = (url) => {
    if (!url || typeof url !== 'string') return;
    const trimmed = url.trim();
    if (!trimmed) return;
    const current = load();
    const filtered = current.filter((u) => u !== trimmed);
    const next = [trimmed, ...filtered].slice(0, MAX);
    save(next);
  };

  const clear = () => save([]);

  const get = () => load();

  return { add, clear, get };
}
