import './OptionListItem.sass';

export default function OptionListItem({ title, type }) {
  return (
    <li className={`option_list_item ${type} font_body_l_r`}>
      <span className="material-symbols-outlined option_checkbox">
        check_box_outline_blank
      </span>

      <span>{title}</span>
    </li>
  );
}