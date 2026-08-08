import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');

const loadCodes = () => import('../../lib/api/codes');

beforeEach(() => {
  vi.resetModules();
  apiFetch.mockReset();
});

describe('getCodeGroups', () => {
  it('fetches the requested groups in one call', async () => {
    apiFetch.mockResolvedValue({
      job_role: [{ code: 'fe', label: '프론트엔드' }],
      difficulty: [{ code: 'easy', label: '쉬움' }],
    });

    const { getCodeGroups } = await loadCodes();
    const result = await getCodeGroups(['job_role', 'difficulty']);

    expect(apiFetch).toHaveBeenCalledWith('/api/codes', {
      query: { groups: 'job_role,difficulty' },
    });
    expect(result.job_role).toEqual([{ code: 'fe', label: '프론트엔드' }]);
  });

  it('serves the second call from cache', async () => {
    apiFetch.mockResolvedValue({ job_role: [{ code: 'fe', label: '프론트엔드' }] });

    const { getCodeGroups } = await loadCodes();
    await getCodeGroups(['job_role']);
    await getCodeGroups(['job_role']);

    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('fetches only the groups missing from cache', async () => {
    apiFetch
      .mockResolvedValueOnce({ job_role: [{ code: 'fe', label: '프론트엔드' }] })
      .mockResolvedValueOnce({ difficulty: [{ code: 'easy', label: '쉬움' }] });

    const { getCodeGroups } = await loadCodes();
    await getCodeGroups(['job_role']);
    const result = await getCodeGroups(['job_role', 'difficulty']);

    expect(apiFetch).toHaveBeenCalledTimes(2);
    expect(apiFetch.mock.calls[1][1]).toEqual({ query: { groups: 'difficulty' } });
    expect(Object.keys(result)).toEqual(['job_role', 'difficulty']);
  });

  it('caches an empty array when the server omits a group', async () => {
    apiFetch.mockResolvedValue({});

    const { getCodeGroups } = await loadCodes();
    const result = await getCodeGroups(['unknown_group']);

    expect(result).toEqual({ unknown_group: [] });
  });

  it('skips the request when every group is cached', async () => {
    apiFetch.mockResolvedValue({ job_role: [] });

    const { getCodeGroups } = await loadCodes();
    await getCodeGroups(['job_role']);
    apiFetch.mockClear();
    await getCodeGroups(['job_role']);

    expect(apiFetch).not.toHaveBeenCalled();
  });
});

describe('getCodes', () => {
  it('returns the code array of a single group', async () => {
    apiFetch.mockResolvedValue({ tech_stack: [{ code: 'react', label: 'React' }] });

    const { getCodes } = await loadCodes();

    await expect(getCodes('tech_stack')).resolves.toEqual([{ code: 'react', label: 'React' }]);
  });
});

describe('labelOf', () => {
  it('resolves the label for a code', async () => {
    apiFetch.mockResolvedValue({ job_role: [{ code: 'fe', label: '프론트엔드' }] });

    const { labelOf } = await loadCodes();

    await expect(labelOf('job_role', 'fe')).resolves.toBe('프론트엔드');
  });

  it('returns the code itself when it is unknown', async () => {
    apiFetch.mockResolvedValue({ job_role: [{ code: 'fe', label: '프론트엔드' }] });

    const { labelOf } = await loadCodes();

    await expect(labelOf('job_role', 'zzz')).resolves.toBe('zzz');
  });

  it('skips the request when the code is empty', async () => {
    const { labelOf } = await loadCodes();

    await expect(labelOf('job_role', null)).resolves.toBe('');
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
