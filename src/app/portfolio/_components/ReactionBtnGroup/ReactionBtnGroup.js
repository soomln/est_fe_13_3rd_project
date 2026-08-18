import styles from './ReactionBtnGroup.module.sass';

import CircleBadge from '@/app/_components/common/CircleBadge';
import ReactionBtn from '../ReactionBtn';

import { togglePortfolioLike, togglePortfolioBookmark } from '@backend/lib/api/portfolio';

export default function ReactionBtnGroup({ item, contentsRef, showToast, updateReaction }) {
  const onMoveTop = () => {
    contentsRef?.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const onCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/portfolio?modal=${item.id}`);

      showToast('URL이 복사되었습니다!');
    } catch (error) {
      console.error('url 복사 실패:', error);
      showToast('URL 복사를 실패했습니다. 다시 시도해주세요!');
    }
  };

  const handleLike = async () => {
    const active = await togglePortfolioLike(item.id);

    updateReaction(item.id, 'like', active);
  };

  const handleBookmark = async () => {
    const active = await togglePortfolioBookmark(item.id);

    updateReaction(item.id, 'bookmark', active);
  };

  return (
    <div className={styles.group}>
      <CircleBadge src='/images/estSoft 1.png' name={item.authorName} size='medium' textColor='#ffffff' />
      <ReactionBtn iconText='thumb_up' value={item.likeCount} isToggle isActive={item.isLiked} onClick={handleLike} />
      <ReactionBtn
        iconText='bookmark'
        value={item.bookmarkCount}
        isToggle
        isActive={item.isBookmarked}
        onClick={handleBookmark}
      />
      <ReactionBtn iconText='share' value='공유' onClick={onCopyUrl} />
      <ReactionBtn iconText='arrow_upward' value='이동' onClick={onMoveTop} />
    </div>
  );
}
