import styles from './SettingButton.module.sass';

export default function SettingButton({ onClick }) {
  return (
    <button
      type="button"
      className={`${styles.setting_button} font_body_m_r`}
      onClick={onClick}
    >
      면접 설정
    </button>
  );
}