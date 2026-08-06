import Image from 'next/image';
import styles from './StackBadge.module.sass';

/**
 * [공통] 기술 스택 배지 목록
 * @param {{ name: string, icon: string }[]} stacks
 */
export default function StackBadge({ stacks = [] }) {
  return (
    <div className={styles.stack_badge}>
      {stacks.map((stack) => (
        <div key={stack.name} className={styles.badge_item}>
          <div className={styles.icon_wrapper}>
            <Image src={stack.icon} alt={stack.name} fill sizes='72px' className={styles.icon_img} />
          </div>
          <span className={styles.name}>{stack.name}</span>
        </div>
      ))}
    </div>
  );
}
