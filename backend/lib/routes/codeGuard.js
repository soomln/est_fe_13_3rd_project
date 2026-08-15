import { badRequest } from '../http/errors';
import { unwrap } from '../http/route';

export async function loadGroups(supabase, groups) {
  const rows = unwrap(
    await supabase
      .from('code_master')
      .select('group_name, code')
      .in('group_name', groups)
      .eq('is_active', true)
  );

  const map = Object.fromEntries(groups.map((g) => [g, []]));
  for (const { group_name, code } of rows ?? []) map[group_name]?.push(code);
  return map;
}

export async function assertCodes(supabase, body, fields) {
  const wanted = Object.entries(fields).filter(([field]) => {
    const value = body[field];
    return field in body && value != null && !(Array.isArray(value) && value.length === 0);
  });
  if (wanted.length === 0) return;

  const codes = await loadGroups(supabase, [...new Set(wanted.map(([, group]) => group))]);

  for (const [field, group] of wanted) {
    const allowed = codes[group];
    const given = Array.isArray(body[field]) ? body[field] : [body[field]];
    const bad = given.find((value) => !allowed.includes(value));

    if (bad !== undefined) {
      throw badRequest(
        `${field} 의 "${bad}" 는 code_master(${group}) 의 코드가 아닙니다. 사용 가능: ${allowed.join(' | ')}`
      );
    }
  }
}
