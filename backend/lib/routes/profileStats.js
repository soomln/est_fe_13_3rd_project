import { defineRoute, resolveUserId, unwrap } from '../http/route';

export const GET = defineRoute(async ({ params, supabase, user }) => {
  const userId = resolveUserId(params.userId, user);

  const row = unwrap(
    await supabase
      .from('v_profile_stats')
      .select('doc_count, portfolio_count, interview_scrap_count')
      .eq('user_id', userId)
      .maybeSingle()
  );

  return {
    docCount: row?.doc_count ?? 0,
    portfolioCount: row?.portfolio_count ?? 0,
    interviewScrapCount: row?.interview_scrap_count ?? 0,
  };
});
