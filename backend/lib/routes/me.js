import { unauthorized } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

const PROFILE_COLUMNS = `
  id, name, avatar_url, desired_role, career_level, email, github_url, bio,
  educations, careers, awards, languages, skill_codes, interest_codes,
  created_at, updated_at
`;

const STAT_COLUMNS = `
  doc_count, portfolio_count, published_portfolio_count, draft_portfolio_count,
  interview_scrap_count, scrapped_company_count, scrapped_post_count,
  scrapped_portfolio_count, my_review_count, my_qbank_count, finished_interview_count
`;

const EMPTY_STATS = {
  docCount: 0,
  portfolioCount: 0,
  publishedPortfolioCount: 0,
  draftPortfolioCount: 0,
  interviewScrapCount: 0,
  scrappedCompanyCount: 0,
  scrappedPostCount: 0,
  scrappedPortfolioCount: 0,
  myReviewCount: 0,
  myQbankCount: 0,
  finishedInterviewCount: 0,
};

function toStats(row) {
  if (!row) return EMPTY_STATS;
  return {
    docCount: row.doc_count ?? 0,
    portfolioCount: row.portfolio_count ?? 0,
    publishedPortfolioCount: row.published_portfolio_count ?? 0,
    draftPortfolioCount: row.draft_portfolio_count ?? 0,
    interviewScrapCount: row.interview_scrap_count ?? 0,
    scrappedCompanyCount: row.scrapped_company_count ?? 0,
    scrappedPostCount: row.scrapped_post_count ?? 0,
    scrappedPortfolioCount: row.scrapped_portfolio_count ?? 0,
    myReviewCount: row.my_review_count ?? 0,
    myQbankCount: row.my_qbank_count ?? 0,
    finishedInterviewCount: row.finished_interview_count ?? 0,
  };
}

export const GET = defineRoute(async ({ user }) => ({ user }));

export const DELETE = defineRoute(
  async ({ supabase }) => {
    unwrap(await supabase.rpc('delete_my_account'));
    return { deleted: true };
  },
  { auth: true }
);

export const GET_ACCOUNT = defineRoute(
  async ({ supabase }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) throw unauthorized();

    const account = data.user;
    const meta = account.app_metadata ?? {};
    const providers = meta.providers ?? (meta.provider ? [meta.provider] : []);

    return {
      id: account.id,
      email: account.email ?? null,
      createdAt: account.created_at ?? null,
      lastSignInAt: account.last_sign_in_at ?? null,
      providers,
    };
  },
  { auth: true }
);

export const GET_SUMMARY = defineRoute(
  async ({ supabase, user }) => {
    const [profile, stats] = await Promise.all([
      supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle(),
      supabase.from('v_profile_stats').select(STAT_COLUMNS).eq('user_id', user.id).maybeSingle(),
    ]);

    return { profile: unwrap(profile), stats: toStats(unwrap(stats)) };
  },
  { auth: true }
);
