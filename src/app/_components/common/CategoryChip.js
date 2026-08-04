import s from './CategoryChip.module.sass';

export default function CategoryChip({ text = 'web', isSelected = false, onClick }) {
  return (
    <button type='button' className={`${s.category_chip} ${isSelected ? s.selected : ''}`} onClick={onClick}>
      {text}
    </button>
  );
}
