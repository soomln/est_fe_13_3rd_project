import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, signOutOfBrowser, startWorld, stopWorld, USERS } from './support/harness';
import { rows } from './support/database';
import {
  createPost,
  deletePost,
  deletePosts,
  getMyPostReactions,
  getPost,
  incrementPostView,
  listMyPosts,
  listMyScrappedPosts,
  listPosts,
  removePostScraps,
  togglePostLike,
  togglePostScrap,
  updatePost,
} from '@backend/lib/api/posts';
import {
  createComment,
  deleteComment,
  getMyCommentLikes,
  listComments,
  toggleCommentLike,
  updateComment,
} from '@backend/lib/api/comments';
import { listMyQbanks, listMyReviews } from '@backend/lib/api/mypage';

const naver = () => rows('companies')[0];

const writeReview = (overrides = {}) =>
  createPost({
    postType: 'review',
    companyId: naver().id,
    title: '네이버 면접 후기',
    body: '분위기가 좋았습니다',
    difficultyCode: 'hard',
    difficultyScore: 4,
    passResultCode: 'pass',
    channelCode: 'online',
    jobRoleCode: 'fe',
    positionLevel: '신입',
    educationLevel: 'bachelor',
    tags: ['#CS'],
    overallComment: '준비 잘하세요',
    ...overrides,
  });

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('writing an interview review', () => {
  beforeEach(() => signInAs(USERS.a));

  it('saves every field the form collects', async () => {
    const post = await writeReview();

    expect(post).toMatchObject({
      postType: 'review',
      companyName: '네이버',
      companySlug: 'naver',
      title: '네이버 면접 후기',
      difficulty: '어려움',
      result: '합격',
      channel: '온라인 지원',
      jobInfo: '프론트엔드 / 신입 / 대졸',
      tags: ['#CS'],
    });
  });

  it('reads back the education level as a label, not a code', async () => {
    const post = await writeReview();

    expect(post.educationLevel).toBe('대졸');
    expect(post.education).toBe('대졸');
  });

  it('keeps a free-text interview channel', async () => {
    const post = await writeReview({ channelCode: 'etc', channelEtc: '잡코리아' });

    expect(post.channel).toBe('잡코리아');
  });

  it('falls back to the etc label when the free text is blank', async () => {
    const post = await writeReview({ channelCode: 'etc', channelEtc: '' });

    expect(post.channel).toBe('기타');
  });

  it('saves a question bank entry', async () => {
    const post = await createPost({
      postType: 'qbank',
      companyId: naver().id,
      questions: ['REST API 의 장점은?', 'CORS 란?'],
    });

    expect(post).toMatchObject({ postType: 'qbank', questions: ['REST API 의 장점은?', 'CORS 란?'] });
  });

  it('counts the questions without being told how many there are', async () => {
    const post = await createPost({
      postType: 'qbank',
      companyId: naver().id,
      questions: ['REST API 의 장점은?', 'CORS 란?', '클로저란?'],
    });

    expect(post.questionCount).toBe(3);
  });

  it('recounts the questions after an edit', async () => {
    const post = await createPost({
      postType: 'qbank',
      companyId: naver().id,
      questions: ['Q1', 'Q2', 'Q3'],
    });

    const edited = await updatePost(post.id, { questions: ['Q1'] });

    expect(edited.questionCount).toBe(1);
  });

  it('rejects an unknown post type', async () => {
    await expect(createPost({ postType: 'diary' })).rejects.toMatchObject({ status: 400 });
  });

  it('rejects questions that are not a list', async () => {
    await expect(createPost({ postType: 'qbank', questions: 'nope' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects tags that are not a list', async () => {
    await expect(createPost({ postType: 'review', tags: 'nope' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('turns a visitor away', async () => {
    signOutOfBrowser();

    await expect(createPost({ postType: 'review' })).rejects.toMatchObject({ status: 401 });
  });
});

describe('reading the board', () => {
  it('lets a visitor read reviews', async () => {
    signInAs(USERS.a);
    await writeReview();
    signOutOfBrowser();

    const board = await listPosts({ type: 'review' });

    expect(board.items).toHaveLength(1);
    expect(board.items[0].authorName).toBe('User A');
  });

  it('separates reviews from question banks', async () => {
    signInAs(USERS.a);
    await writeReview();
    await createPost({ postType: 'qbank', companyId: naver().id, questions: ['Q'] });

    await expect(listPosts({ type: 'review' })).resolves.toMatchObject({ total: 1 });
    await expect(listPosts({ type: 'qbank' })).resolves.toMatchObject({ total: 1 });
  });

  it('rejects an unknown type', async () => {
    await expect(listPosts({ type: 'diary' })).rejects.toMatchObject({ status: 400 });
  });

  it('filters by company', async () => {
    signInAs(USERS.a);
    await writeReview();

    await expect(listPosts({ companySlug: 'naver' })).resolves.toMatchObject({ total: 1 });
    await expect(listPosts({ companySlug: 'kakao' })).resolves.toMatchObject({ total: 0 });
  });

  it('searches by title', async () => {
    signInAs(USERS.a);
    await writeReview();

    await expect(listPosts({ q: '네이버' })).resolves.toMatchObject({ total: 1 });
    await expect(listPosts({ q: '없는제목' })).resolves.toMatchObject({ total: 0 });
  });

  it('rejects an unknown sort', async () => {
    await expect(listPosts({ sort: 'random' })).rejects.toMatchObject({ status: 400 });
  });

  it('opens the detail page', async () => {
    signInAs(USERS.a);
    const post = await writeReview();
    signOutOfBrowser();

    await expect(getPost(post.id)).resolves.toMatchObject({ id: post.id, body: '분위기가 좋았습니다' });
  });

  it('answers 404 for a post that does not exist', async () => {
    await expect(getPost('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('counts a visit', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    await incrementPostView(post.id);

    await expect(getPost(post.id)).resolves.toMatchObject({ viewCount: 1 });
  });

  it('pages through a long board', async () => {
    signInAs(USERS.a);
    await writeReview({ title: 'a' });
    await writeReview({ title: 'b' });
    await writeReview({ title: 'c' });

    const page = await listPosts({ page: 2, pageSize: 2 });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(3);
  });
});

describe('reacting to a post', () => {
  it('counts helpful marks and scraps separately', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    await togglePostLike(post.id);
    await togglePostScrap(post.id);

    await expect(getPost(post.id)).resolves.toMatchObject({ likeCount: 1, scrapCount: 1 });
  });

  it('marks which posts the member already reacted to', async () => {
    signInAs(USERS.a);
    const post = await writeReview();
    await togglePostScrap(post.id);

    const mine = await getMyPostReactions([post.id]);

    expect(mine.scrapped.has(post.id)).toBe(true);
    expect(mine.liked.has(post.id)).toBe(false);
  });

  it('sorts the board by helpful marks', async () => {
    signInAs(USERS.a);
    await writeReview({ title: '조용한 글' });
    const loud = await writeReview({ title: '인기 글' });
    await togglePostLike(loud.id);

    const board = await listPosts({ sort: 'popular' });

    expect(board.items[0].title).toBe('인기 글');
  });

  it('turns a visitor away', async () => {
    await expect(togglePostLike('p1')).rejects.toMatchObject({ status: 401 });
  });
});

describe('my posts and scraps', () => {
  it('separates my reviews from my question banks', async () => {
    signInAs(USERS.a);
    await writeReview();
    await createPost({ postType: 'qbank', companyId: naver().id, questions: ['Q'] });

    await expect(listMyReviews()).resolves.toMatchObject({ total: 1 });
    await expect(listMyQbanks()).resolves.toMatchObject({ total: 1 });
  });

  it('hides other member posts from my list', async () => {
    signInAs(USERS.a);
    await writeReview();

    signInAs(USERS.b);

    await expect(listMyPosts()).resolves.toMatchObject({ total: 0 });
  });

  it('turns a visitor away from my list', async () => {
    await expect(listMyPosts()).rejects.toMatchObject({ status: 401 });
  });

  it('collects scrapped posts newest first', async () => {
    signInAs(USERS.a);
    const first = await writeReview({ title: '첫번째' });
    const second = await writeReview({ title: '두번째' });

    signInAs(USERS.b);
    await togglePostScrap(first.id);
    await togglePostScrap(second.id);

    const scraps = await listMyScrappedPosts();

    expect(scraps.items.map((p) => p.title)).toEqual(['두번째', '첫번째']);
  });

  it('pages through the scraps on the client', async () => {
    signInAs(USERS.a);
    const first = await writeReview({ title: '첫번째' });
    const second = await writeReview({ title: '두번째' });
    await togglePostScrap(first.id);
    await togglePostScrap(second.id);

    const page = await listMyScrappedPosts({ page: 2, pageSize: 1 });

    expect(page.items.map((p) => p.title)).toEqual(['첫번째']);
    expect(page.total).toBe(2);
  });

  it('is empty before anything is scrapped', async () => {
    signInAs(USERS.a);

    await expect(listMyScrappedPosts()).resolves.toMatchObject({ total: 0 });
  });

  it('removes scraps in bulk', async () => {
    signInAs(USERS.a);
    const post = await writeReview();
    await togglePostScrap(post.id);

    await expect(removePostScraps([post.id])).resolves.toBe(1);
    await expect(listMyScrappedPosts()).resolves.toMatchObject({ total: 0 });
  });
});

describe('editing and deleting posts', () => {
  it('edits my own post', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    const updated = await updatePost(post.id, { title: '수정한 제목' });

    expect(updated.title).toBe('수정한 제목');
  });

  it('rejects an empty edit', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    await expect(updatePost(post.id, {})).rejects.toMatchObject({ status: 400 });
  });

  it('refuses a cross-account edit', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    signInAs(USERS.b);

    await expect(updatePost(post.id, { title: 'stolen' })).rejects.toMatchObject({ status: 404 });
  });

  it('deletes my own post', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    await expect(deletePost(post.id)).resolves.toEqual({ deleted: 1 });
    await expect(getPost(post.id)).rejects.toMatchObject({ status: 404 });
  });

  it('refuses a cross-account delete', async () => {
    signInAs(USERS.a);
    const post = await writeReview();

    signInAs(USERS.b);
    await expect(deletePost(post.id)).rejects.toMatchObject({ status: 404 });

    await expect(getPost(post.id)).resolves.toMatchObject({ id: post.id });
  });

  it('deletes a selection at once', async () => {
    signInAs(USERS.a);
    const a = await writeReview({ title: 'a' });
    const b = await writeReview({ title: 'b' });

    await expect(deletePosts([a.id, b.id])).resolves.toBe(2);
  });

  it('ignores an empty selection', async () => {
    signInAs(USERS.a);

    await expect(deletePosts([])).resolves.toBe(0);
  });

  it('takes the comments and reactions down with the post', async () => {
    signInAs(USERS.a);
    const post = await writeReview();
    await createComment(post.id, '좋은 후기네요');
    await togglePostLike(post.id);

    await deletePost(post.id);

    expect(rows('comments')).toHaveLength(0);
    expect(rows('reactions')).toHaveLength(0);
    expect(rows('reaction_counts')).toHaveLength(0);
  });
});

describe('commenting on a post', () => {
  let post;

  beforeEach(async () => {
    signInAs(USERS.a);
    post = await writeReview();
  });

  it('lets a visitor read comments', async () => {
    await createComment(post.id, '좋은 후기네요');
    signOutOfBrowser();

    const page = await listComments(post.id);

    expect(page.items[0]).toMatchObject({ body: '좋은 후기네요', authorName: 'User A' });
  });

  it('turns a visitor away from writing', async () => {
    signOutOfBrowser();

    await expect(createComment(post.id, '댓글')).rejects.toMatchObject({ status: 401 });
  });

  it('rejects a blank comment', async () => {
    await expect(createComment(post.id, '   ')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a comment over two thousand characters', async () => {
    await expect(createComment(post.id, 'ㄱ'.repeat(2001))).rejects.toMatchObject({ status: 400 });
  });

  it('accepts a comment of exactly two thousand characters', async () => {
    await expect(createComment(post.id, 'ㄱ'.repeat(2000))).resolves.toMatchObject({
      postId: post.id,
    });
  });

  it('shows the comment count on the board', async () => {
    await createComment(post.id, '댓글1');
    await createComment(post.id, '댓글2');

    await expect(getPost(post.id)).resolves.toMatchObject({ commentCount: 2 });
  });

  it('sorts comments by newest and by likes', async () => {
    const first = await createComment(post.id, '첫번째');
    await createComment(post.id, '두번째');
    await toggleCommentLike(first.id);

    const latest = await listComments(post.id, { sort: 'latest' });
    const popular = await listComments(post.id, { sort: 'popular' });

    expect(latest.items[0].body).toBe('두번째');
    expect(popular.items[0].body).toBe('첫번째');
  });

  it('rejects an unknown comment sort', async () => {
    await expect(listComments(post.id, { sort: 'random' })).rejects.toMatchObject({ status: 400 });
  });

  it('marks which comments the member liked', async () => {
    const comment = await createComment(post.id, '댓글');
    await toggleCommentLike(comment.id);

    const mine = await getMyCommentLikes([comment.id]);

    expect(mine.has(comment.id)).toBe(true);
  });

  it('edits my own comment', async () => {
    const comment = await createComment(post.id, '댓글');

    await expect(updateComment(comment.id, '수정한 댓글')).resolves.toMatchObject({
      body: '수정한 댓글',
    });
  });

  it('refuses a cross-account comment edit', async () => {
    const comment = await createComment(post.id, '댓글');

    signInAs(USERS.b);

    await expect(updateComment(comment.id, 'stolen')).rejects.toMatchObject({ status: 404 });
  });

  it('deletes my own comment', async () => {
    const comment = await createComment(post.id, '댓글');

    await expect(deleteComment(comment.id)).resolves.toEqual({ deleted: 1 });
    await expect(listComments(post.id)).resolves.toMatchObject({ total: 0 });
  });

  it('refuses a cross-account comment delete', async () => {
    const comment = await createComment(post.id, '댓글');

    signInAs(USERS.b);
    await expect(deleteComment(comment.id)).rejects.toMatchObject({ status: 404 });
  });

  it('pages through a long thread', async () => {
    await createComment(post.id, '댓글1');
    await createComment(post.id, '댓글2');
    await createComment(post.id, '댓글3');

    const page = await listComments(post.id, { page: 2, pageSize: 2 });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(3);
  });
});
