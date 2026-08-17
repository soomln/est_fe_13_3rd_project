import styles from './OptionListItem.module.sass';

export default function OptionListItem({
  title,
  type,
  isSelected,
  onClick,
}) {
  return (
    <li
      className={`${styles.option_list_item} ${styles[type]} font_body_l_r ${
        isSelected ? 'is_selected' : ''
      }`}
      onClick={onClick}
    >
      <span className={`material-symbols-outlined ${styles.option_checkbox}`}>
        {isSelected ? 'check_box' : 'check_box_outline_blank'}
      </span>

      <span>{title}</span>
    </li>
  );
}