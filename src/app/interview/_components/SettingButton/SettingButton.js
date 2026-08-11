import './SettingButton.sass';

export default function SettingButton({ onClick }) {
  return (
    <button
      type="button"
      className="setting_button font_body_m_r"
      onClick={onClick}
    >
      면접 설정
    </button>
  );
}