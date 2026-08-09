import styles from './PrimaryBtn.module.sass';

// 초록 채움 버튼
export default function PrimaryBtn({ label, onClick, as: Tag = 'button' }) {
  return (
    <Tag
      className={`${styles.primary_btn} font_h4`}
      type={Tag === 'button' ? 'button' : undefined}
      onClick={onClick}
    >
      {label}
    </Tag>
  );
}
