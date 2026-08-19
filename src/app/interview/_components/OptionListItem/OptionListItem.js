import styles from './OptionListItem.module.sass';

export default function OptionListItem({
  title,
  type,
  isSelected,
  onClick,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <li
      className={`${styles.option_list_item} ${styles[type]} font_body_l_r ${
        isSelected ? 'is_selected' : ''
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
    >
      <span className={`material-symbols-outlined ${styles.option_checkbox}`}>
        {isSelected ? 'check_box' : 'check_box_outline_blank'}
      </span>

      <span>{title}</span>
    </li>
  );
}