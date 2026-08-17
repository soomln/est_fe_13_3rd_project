import { describe, expect, it } from 'vitest';

import { createSupabaseStub } from '../helpers/supabase';
import { assertCodes, loadGroups } from '../../lib/routes/codeGuard';

const CODES = {
  data: [
    { group_name: 'job_role', code: 'frontend' },
    { group_name: 'job_role', code: 'backend' },
    { group_name: 'difficulty', code: 'hard' },
    { group_name: 'tech_stack', code: 'react' },
    { group_name: 'tech_stack', code: 'nodejs' },
  ],
  error: null,
};

const stub = (codes = CODES) => createSupabaseStub({ tables: { code_master: codes } });

const FIELDS = { jobRoleCode: 'job_role', difficultyCode: 'difficulty', skills: 'tech_stack' };

describe('loadGroups', () => {
  it('buckets the codes by group', async () => {
    await expect(loadGroups(stub(), ['job_role', 'difficulty'])).resolves.toEqual({
      job_role: ['frontend', 'backend'],
      difficulty: ['hard'],
    });
  });

  it('still answers with a key for a group that has no codes', async () => {
    await expect(loadGroups(stub(), ['nothing_here'])).resolves.toEqual({ nothing_here: [] });
  });

  it('survives code_master answering with nothing at all', async () => {
    const empty = stub({ data: null, error: null });

    await expect(loadGroups(empty, ['job_role'])).resolves.toEqual({ job_role: [] });
  });
});

describe('assertCodes', () => {
  it('passes a valid code', async () => {
    await expect(
      assertCodes(stub(), { jobRoleCode: 'frontend' }, FIELDS)
    ).resolves.toBeUndefined();
  });

  it('names the field, the bad value and the allowed codes', async () => {
    await expect(assertCodes(stub(), { jobRoleCode: '프론트엔드' }, FIELDS)).rejects.toThrowError(
      'jobRoleCode 의 "프론트엔드" 는 code_master(job_role) 의 코드가 아닙니다. 사용 가능: frontend | backend'
    );
  });

  it('answers 400, not 500', async () => {
    await expect(assertCodes(stub(), { jobRoleCode: 'nope' }, FIELDS)).rejects.toMatchObject({
      status: 400,
    });
  });

  it('lets null through as "not filled in"', async () => {
    await expect(assertCodes(stub(), { jobRoleCode: null }, FIELDS)).resolves.toBeUndefined();
  });

  it('ignores a field that was not sent', async () => {
    await expect(assertCodes(stub(), { title: '제목' }, FIELDS)).resolves.toBeUndefined();
  });

  it('checks every element of an array field', async () => {
    await expect(assertCodes(stub(), { skills: ['react', '리액트'] }, FIELDS)).rejects.toThrowError(
      'skills 의 "리액트"'
    );
  });

  it('passes an array where every element is real', async () => {
    await expect(
      assertCodes(stub(), { skills: ['react', 'nodejs'] }, FIELDS)
    ).resolves.toBeUndefined();
  });

  it('treats an empty array as nothing to check', async () => {
    const supabase = stub();

    await assertCodes(supabase, { skills: [] }, FIELDS);

    expect(supabase.queries).toHaveLength(0);
  });

  it('reads code_master once for several fields', async () => {
    const supabase = stub();

    await assertCodes(supabase, { jobRoleCode: 'frontend', difficultyCode: 'hard' }, FIELDS);

    expect(supabase.queries).toHaveLength(1);
  });

  it('does not read code_master at all when nothing is sent', async () => {
    const supabase = stub();

    await assertCodes(supabase, {}, FIELDS);

    expect(supabase.queries).toHaveLength(0);
  });

  it('rejects a field whose group is missing from code_master', async () => {
    const supabase = stub({ data: null, error: null });

    await expect(assertCodes(supabase, { jobRoleCode: 'frontend' }, FIELDS)).rejects.toThrowError(
      '사용 가능: '
    );
  });

  it('rejects everything when the group is empty', async () => {
    const empty = stub({ data: [], error: null });

    await expect(assertCodes(empty, { jobRoleCode: 'frontend' }, FIELDS)).rejects.toMatchObject({
      status: 400,
    });
  });
});
