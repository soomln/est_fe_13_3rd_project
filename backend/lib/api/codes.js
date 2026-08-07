import { apiFetch } from './_fetch';

const cache = new Map();

export async function getCodes(group) {
  const result = await getCodeGroups([group]);
  return result[group];
}

export async function getCodeGroups(groups) {
  const missing = groups.filter((g) => !cache.has(g));

  if (missing.length > 0) {
    const fetched = await apiFetch('/api/codes', { query: { groups: missing.join(',') } });
    for (const group of missing) {
      cache.set(group, fetched[group] ?? []);
    }
  }

  return Object.fromEntries(groups.map((g) => [g, cache.get(g) ?? []]));
}

export async function labelOf(group, code) {
  if (!code) return '';
  const codes = await getCodes(group);
  return codes.find((c) => c.code === code)?.label ?? code;
}
