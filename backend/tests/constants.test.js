import { describe, expect, it } from 'vitest';

import {
  DOCUMENT_LIMIT,
  PAGE_SIZE,
  REACTION,
  SCORE_SCALE,
  SORT,
  UPLOAD_LIMIT,
} from '../lib/constants';

describe('PAGE_SIZE', () => {
  it('holds the values measured from the design', () => {
    expect(PAGE_SIZE).toEqual({
      companies: 20,
      templates: 16,
      portfolioGallery: 20,
      profilePortfolios: 15,
      reviews: 10,
      qbank: 10,
      documents: 10,
      interviewScraps: 6,
      myQbank: 4,
      scrappedCompanies: 9,
      myPortfolios: 9,
      comments: 20,
    });
  });

  it('every value is a positive integer', () => {
    expect(Object.values(PAGE_SIZE).every((v) => Number.isInteger(v) && v > 0)).toBe(true);
  });
});

describe('SORT', () => {
  it('keys match values so typos are caught', () => {
    expect(Object.entries(SORT).every(([key, value]) => key === value)).toBe(true);
  });
});

describe('DOCUMENT_LIMIT', () => {
  it('is 10 per document type', () => {
    expect(DOCUMENT_LIMIT).toBe(10);
  });
});

describe('SCORE_SCALE', () => {
  it('is a 1 to 5 scale in whole points', () => {
    expect(SCORE_SCALE).toEqual({ min: 1, max: 5, step: 1 });
  });
});

describe('UPLOAD_LIMIT', () => {
  it('avatars allow 2MB and three image types', () => {
    expect(UPLOAD_LIMIT.avatar.maxBytes).toBe(2 * 1024 * 1024);
    expect(UPLOAD_LIMIT.avatar.mimes).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('portfolio images allow 5MB, 15 files and GIF', () => {
    expect(UPLOAD_LIMIT.portfolio.maxBytes).toBe(5 * 1024 * 1024);
    expect(UPLOAD_LIMIT.portfolio.maxCount).toBe(15);
    expect(UPLOAD_LIMIT.portfolio.mimes).toContain('image/gif');
  });
});

describe('REACTION', () => {
  it('every entry is a targetType and kind pair', () => {
    for (const pair of Object.values(REACTION)) {
      expect(pair).toHaveLength(2);
      expect(['like', 'bookmark']).toContain(pair[1]);
    }
  });

  it('maps each screen to the right reaction target', () => {
    expect(REACTION.portfolioLike).toEqual(['portfolio', 'like']);
    expect(REACTION.postScrap).toEqual(['post', 'bookmark']);
    expect(REACTION.companyBookmark).toEqual(['company', 'bookmark']);
    expect(REACTION.interviewQaScrap).toEqual(['interview_qa', 'bookmark']);
  });
});
