import styles from './ActionBtnGroup.module.sass';
import CircleBadge from '@/app/_components/common/CircleBadge';
import ActionBtn from '@/app/portfolio/_components/Modal/ActionBtn';

export default function ActionBtnGroup({ contentsRef, showToast }) {
  const onMoveTop = () => {
    console.log('1. 버튼 클릭됨');
    console.log('2. ref 요소:', contentsRef?.current);
    console.log('3. 현재 스크롤 위치:', contentsRef?.current?.scrollTop);
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
      <CircleBadge src='/images/estSoft 1.png' name='박소영' size='medium' textColor='#ffffff' />
      <ActionBtn iconText='thumb_up_off_alt' value={50} isActiveBtn={true} onClick={() => {}} />
      <ActionBtn iconText='bookmark_border' value={50} isActiveBtn={true} onClick={() => {}} />
      <ActionBtn iconText='share' value={'공유'} onClick={onCopyUrl} />
      <ActionBtn iconText='arrow_upward' value={'이동'} onClick={onMoveTop} />
    </div>
  );
}
