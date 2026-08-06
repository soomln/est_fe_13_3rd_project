import styles from './ActionBtnGroup.module.sass';
import CircleBadge from '@/app/_components/common/CircleBadge';
import ActionBtn from '@/app/portfolio/_components/Modal/ActionBtn';

export default function ActionBtnGroup({ contentsRef }) {
  const onMoveTop = () => {
    console.log('1. 버튼 클릭됨');
    console.log('2. ref 요소:', contentsRef?.current);
    console.log('3. 현재 스크롤 위치:', contentsRef?.current?.scrollTop);
    contentsRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div className={styles.group}>
      <CircleBadge src='/images/estSoft 1.png' name='박소영' size='medium' textColor='#ffffff' />
      <ActionBtn iconText='thumb_up_off_alt' value={50} isActiveBtn={true} onClick={() => {}} />
      <ActionBtn iconText='bookmark_border' value={50} isActiveBtn={true} onClick={() => {}} />
      <ActionBtn iconText='share' value={'공유'} onClick={() => {}} />
      <ActionBtn iconText='arrow_upward' value={'이동'} onClick={onMoveTop} />
    </div>
  );
}
