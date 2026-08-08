import { defineRoute, resolveUserId, unwrap } from '../http/route';

const COLUMNS = `
  doc_count, portfolio_count, published_portfolio_count, draft_portfolio_count,
  interview_scrap_count, scrapped_company_count, scrapped_post_count,
  scrapped_portfolio_count, my_review_count, my_qbank_count, finished_interview_count
`;

export const GET = defineRoute(async ({ params, supabase, user }) => {
  const userId = resolveUserId(params.userId, user);

  const row = unwrap(
    await supabase.from('v_profile_stats').select(COLUMNS).eq('user_id', userId).maybeSingle()
  );

  return {
    docCount: row?.doc_count ?? 0,
    portfolioCount: row?.portfolio_count ?? 0,
    publishedPortfolioCount: row?.published_portfolio_count ?? 0,
    draftPortfolioCount: row?.draft_portfolio_count ?? 0,
    interviewScrapCount: row?.interview_scrap_count ?? 0,
    scrappedCompanyCount: row?.scrapped_company_count ?? 0,
    scrappedPostCount: row?.scrapped_post_count ?? 0,
    scrappedPortfolioCount: row?.scrapped_portfolio_count ?? 0,
    myReviewCount: row?.my_review_count ?? 0,
    myQbankCount: row?.my_qbank_count ?? 0,
    finishedInterviewCount: row?.finished_interview_count ?? 0,
  };
});
