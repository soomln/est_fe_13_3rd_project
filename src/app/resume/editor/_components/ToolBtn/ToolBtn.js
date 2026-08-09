import styles from './ToolBtn.module.sass';

// 툴바 아이콘 버튼. isActive 를 넘기면 켬/끔 버튼이 된다
export default function ToolBtn({ icon, label, isActive, onClick }) {
  return (
    <button
      type='button'
      className={`${styles.tool_btn} ${isActive ? styles.tool_btn_active : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
    >
      <span className='material-symbols-sharp' aria-hidden='true'>
        {icon}
      </span>
    </button>
  );
}
