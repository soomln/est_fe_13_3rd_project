export const PAGE_SIZE = {
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
};

export const SORT = {
  latest: 'latest',
  popular: 'popular',
  views: 'views',
  bookmarks: 'bookmarks',
};

export const DOCUMENT_LIMIT = 10;

export const UPLOAD_LIMIT = {
  avatar: { maxBytes: 2 * 1024 * 1024, mimes: ['image/jpeg', 'image/png', 'image/webp'] },
  portfolio: {
    maxBytes: 5 * 1024 * 1024,
    maxCount: 15,
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
};

export const REACTION = {
  portfolioLike: ['portfolio', 'like'],
  portfolioBookmark: ['portfolio', 'bookmark'],
  postLike: ['post', 'like'],
  postScrap: ['post', 'bookmark'],
  companyBookmark: ['company', 'bookmark'],
  commentLike: ['comment', 'like'],
  interviewQaScrap: ['interview_qa', 'bookmark'],
  templateBookmark: ['template', 'bookmark'],
};
