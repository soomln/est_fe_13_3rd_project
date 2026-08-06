import styles from './ActionBtnGroup.module.sass';
import CircleBadge from '@/app/_components/common/CircleBadge';
import ActionBtn from '@/app/portfolio/_components/Modal/ActionBtn';

export default function ActionBtnGroup({}) {
  return (
    <div className={styles.group}>
      <CircleBadge src='/images/estSoft 1.png' name='박소영' size='medium' textColor='#ffffff' />
      <ActionBtn iconText='thumb_up_off_alt' value={50} isActiveBtn={true} onClick={() => {}} />
      <ActionBtn iconText='bookmark_border' value={50} isActiveBtn={true} onClick={() => {}} />
      <ActionBtn iconText='share' value={'공유'} onClick={() => {}} />
      <ActionBtn iconText='arrow_upward' value={'이동'} onClick={() => {}} />
    </div>
  );
}
