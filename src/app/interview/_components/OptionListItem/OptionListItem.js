import './OptionListItem.sass';

export default function OptionListItem({
  title,
  type,
  isSelected,
  onClick,
}) {
  return (
    <li
      className={`option_list_item ${type} font_body_l_r ${
        isSelected ? 'is_selected' : ''
      }`}
      onClick={onClick}
    >
      <span className="material-symbols-outlined option_checkbox">
        {isSelected ? 'check_box' : 'check_box_outline_blank'}
      </span>

      <span>{title}</span>
    </li>
  );
}