'use client';

import { useEffect, useRef, useState } from 'react';

import {
  createComment,
  deleteComment,
  listComments,
  toggleCommentLike,
  getMyCommentLikes,
} from '@backend/lib/api/comments';
import { useAuth } from '@/app/_components/auth';
import CommentItem from '@/app/search-companies/_components/CommentItem';
import SelectBox from '@/app/search-companies/_components/SelectBox';
import styles from './CommentSection.module.sass';

const SORT_OPTIONS = [
  { code: 'popular', label: '추천순' },
  { code: 'latest', label: '최신순' },
];

export default function CommentSection({ postId }) {
  const { user, isLoggedIn, openLogin } = useAuth();

  const [comments, setComments] = useState([]);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [sort, setSort] = useState('popular');
  const [body, setBody] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // 같은 요청이 두 번 나가지 않도록 막는다 (state 는 같은 tick 에서 갱신이 늦다)
  const isPostingRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    async function fetchComments() {
      try {
        const result = await listComments(postId, { sort });
        const items = result.items ?? [];

        // getMyCommentLikes 는 Set 을 돌려준다
        const liked =
          isLoggedIn && items.length > 0 ? await getMyCommentLikes(items.map((item) => item.id)) : new Set();

        if (ignore) return;

        setComments(items);
        setLikedIds(liked);
      } catch (error) {
        console.error(error);
      }
    }

    fetchComments();

    return () => {
      ignore = true;
    };
  }, [postId, sort, isLoggedIn, reloadKey]);

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    const value = body.trim();

    if (!value || isPostingRef.current) return;

    isPostingRef.current = true;
    setIsPosting(true);
    setBody('');

    try {
      await createComment(postId, value);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(error);
      setBody(value);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      isPostingRef.current = false;
      setIsPosting(false);
    }
  };

  const handleLikeClick = async (comment) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    try {
      await toggleCommentLike(comment.id);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (comment) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;

    try {
      await deleteComment(comment.id);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <section className={styles.comments}>
      <div className={styles.comments_form}>
        <span className={`material-symbols-rounded ${styles.comments_avatar}`} aria-hidden='true'>
          account_circle
        </span>

        <input
          type='text'
          className={`${styles.comments_input} font_body_l_r`}
          placeholder='댓글을 입력해주세요.'
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;

            event.preventDefault();
            handleSubmit();
          }}
        />

        <button
          type='button'
          className={`${styles.comments_submit} font_body_l_r`}
          onClick={handleSubmit}
          disabled={isPosting}
        >
          등록
        </button>
      </div>

      <div className={styles.comments_sort}>
        <SelectBox value={sort} options={SORT_OPTIONS} onChange={setSort} />
      </div>

      {comments.length === 0 ? (
        <p className={styles.comments_empty}>아직 댓글이 없습니다.</p>
      ) : (
        <ul className={styles.comments_list}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isLiked={likedIds.has(comment.id)}
              isMine={!!user && comment.authorId === user.id}
              onLikeClick={() => handleLikeClick(comment)}
              onDeleteClick={() => handleDeleteClick(comment)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
