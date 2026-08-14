import styles from './ReactionBtnGroup.module.sass';
import CircleBadge from '@/app/_components/common/CircleBadge';
import ReactionBtn from '@/app/portfolio/_components/Modal/ReactionBtn';

export default function ReactionBtnGroup({ item, contentsRef, showToast, updateReactionCount }) {
  const onMoveTop = () => {
    contentsRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('URL이 복사되었습니다!');
    } catch (err) {
      console.error('url 복사 실패:', err);
      showToast('URL 복사를 실패했습니다. 다시 시도해주세요!');
    }
  };

  return (
    <div className={styles.group}>
      <CircleBadge src='/images/estSoft 1.png' name={item.authorName} size='medium' textColor='#ffffff' />
      <ReactionBtn
        iconText='thumb_up_off_alt'
        value={item.likeCount}
        isToggle={true}
        onClick={(isActive) => {
          updateReactionCount(item.id, 'likeCount', isActive ? -1 : 1);
        }}
      />
      <ReactionBtn
        iconText='bookmark_border'
        value={item.bookmarkCount}
        isToggle={true}
        onClick={(isActive) => {
          updateReactionCount(item.id, 'bookmarkCount', isActive ? -1 : 1);
        }}
      />
      <ReactionBtn iconText='share' value={'공유'} onClick={onCopyUrl} />
      <ReactionBtn iconText='arrow_upward' value={'이동'} onClick={onMoveTop} />
    </div>
  );
}
