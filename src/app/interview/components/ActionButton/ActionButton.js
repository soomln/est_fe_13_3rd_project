import './ActionButton.sass';

export default function ActionButton({
  text,
  onClick,
}) {
  return (
    <button
      type="button"
      className="action_button font_body_l_b"
      onClick={onClick}
    >
      {text}
    </button>
  );
}