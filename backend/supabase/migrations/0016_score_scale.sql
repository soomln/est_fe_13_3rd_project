update public.posts
   set difficulty_score = least(5, greatest(1, round(difficulty_score)))
 where difficulty_score is not null
   and difficulty_score is distinct from least(5, greatest(1, round(difficulty_score)));

update public.posts
   set problem_score = least(5, greatest(1, round(problem_score)))
 where problem_score is not null
   and problem_score is distinct from least(5, greatest(1, round(problem_score)));

alter table public.posts drop constraint if exists posts_difficulty_score_scale;
alter table public.posts add constraint posts_difficulty_score_scale
  check (
    difficulty_score is null
    or (
      difficulty_score >= 1
      and difficulty_score <= 5
      and difficulty_score = round(difficulty_score)
    )
  );

alter table public.posts drop constraint if exists posts_problem_score_scale;
alter table public.posts add constraint posts_problem_score_scale
  check (
    problem_score is null
    or (
      problem_score >= 1
      and problem_score <= 5
      and problem_score = round(problem_score)
    )
  );

comment on column public.posts.difficulty_score is
  '면접 난이도. 1~5 정수만 허용한다(1점 단위). 평균은 v_companies.avg_difficulty 가 소수 1자리로 낸다';

comment on column public.posts.problem_score is
  '문제 난이도(족보 전용). 1~5 정수만 허용한다(1점 단위)';
