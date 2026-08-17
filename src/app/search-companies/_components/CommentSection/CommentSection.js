'use client';

import { useEffect, useState } from 'react';

import { createComment, listComments, toggleCommentLike, getMyCommentLikes } from '@backend/lib/api/comments';
import { useAuth } from '@/app/_components/auth';
import CommentItem from '@/app/search-companies/_components/CommentItem';
import SelectBox from '@/app/search-companies/_components/SelectBox';
import styles from './CommentSection.module.sass';

const SORT_OPTIONS = [
  { code: 'popular', label: '추천순' },
  { code: 'latest', label: '최신순' },
];

export default function CommentSection({ postId }) {
  const { isLoggedIn, openLogin } = useAuth();

  const [comments, setComments] = useState([]);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [sort, setSort] = useState('popular');
  const [body, setBody] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

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

    if (!body.trim()) return;

    try {
      await createComment(postId, body.trim());
      setBody('');
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(error);
      alert('댓글 등록에 실패했습니다.');
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

        <button type='button' className={`${styles.comments_submit} font_body_l_r`} onClick={handleSubmit}>
          등록
        </button>
      </div>

      <div className={styles.comments_sort}>
        <SelectBox label='추천순' value={sort} options={SORT_OPTIONS} onChange={setSort} />
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
              onLikeClick={() => handleLikeClick(comment)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
