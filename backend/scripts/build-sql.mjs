import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', 'supabase');
const withSeed = process.argv.includes('seed');

function collect(dir) {
  return readdirSync(join(ROOT, dir))
    .filter((f) => f.endsWith('.sql') && !f.startsWith('0000_reset'))
    .sort()
    .map((f) => {
      const body = readFileSync(join(ROOT, dir, f), 'utf8');
      return `-- ${'='.repeat(76)}\n-- ${dir}/${f}\n-- ${'='.repeat(76)}\n\n${body}\n`;
    });
}

const parts = [
  '-- 자동 생성 파일. 직접 수정하지 말고 migrations/ 안의 파일을 수정할 것',
  '-- 생성: npm run db:sql',
  '',
  ...collect('migrations'),
  ...(withSeed ? collect('seed') : []),
];

const out = join(ROOT, '_combined.sql');
writeFileSync(out, parts.join('\n'), 'utf8');
console.log(`생성됨: ${out}${withSeed ? ' (시드 포함)' : ''}`);
