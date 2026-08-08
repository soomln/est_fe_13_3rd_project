import { PAGE_SIZE } from '../constants';
import { apiFetch } from './_fetch';
import { deleteMyAccount } from './auth';
import { listMyBookmarkedCompanies, removeCompanyBookmarks } from './companies';
import { deleteDocuments, listMyDocuments } from './documents';
import { deleteQas, listMyScraps, removeQaScraps } from './interview';
import {
  deletePortfolios,
  listMyBookmarkedPortfolios,
  listMyPortfolios,
  removePortfolioBookmarks,
} from './portfolio';
import { deletePosts, listMyPosts, listMyScrappedPosts, removePostScraps } from './posts';
import { getMyProfile, getMyProfileStats, removeAvatar, updateProfile, uploadAvatar } from './profile';

export async function getMyAccount() {
  return apiFetch('/api/me/account');
}

export async function getMySummary() {
  return apiFetch('/api/me/summary');
}

export async function listMyScrappedCompanies({ page = 1, pageSize = PAGE_SIZE.scrappedCompanies } = {}) {
  return listMyBookmarkedCompanies({ page, pageSize });
}

export async function listMyScrappedPortfolios({ page = 1, pageSize = PAGE_SIZE.myPortfolios } = {}) {
  return listMyBookmarkedPortfolios({ page, pageSize });
}

export async function listMyQbanks({ page = 1, pageSize = PAGE_SIZE.myQbank } = {}) {
  return listMyPosts({ type: 'qbank', page, pageSize });
}

export async function listMyReviews({ page = 1, pageSize = PAGE_SIZE.reviews } = {}) {
  return listMyPosts({ type: 'review', page, pageSize });
}

export {
  deleteDocuments,
  deleteMyAccount,
  deletePortfolios,
  deletePosts,
  deleteQas,
  getMyProfile,
  getMyProfileStats,
  listMyDocuments,
  listMyPortfolios,
  listMyScrappedPosts,
  listMyScraps,
  removeAvatar,
  removeCompanyBookmarks,
  removePortfolioBookmarks,
  removePostScraps,
  removeQaScraps,
  updateProfile,
  uploadAvatar,
};
