import styles from './Tab.module.sass';

export default function Tab({ iconText, isActive = false, onChangeTab, activeBgColor = '#ffffff' }) {
  return (
    <button
      type='button'
      className={`${styles.tab}`}
      style={{ backgroundColor: isActive ? activeBgColor : undefined }}
      onClick={onChangeTab}
    >
      <span className={`${styles.icon} material-symbols-sharp`}>{iconText}</span>
    </button>
  );
}
