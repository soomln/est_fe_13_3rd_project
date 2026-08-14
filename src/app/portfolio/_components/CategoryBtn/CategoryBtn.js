import styles from './CategoryBtn.module.sass';

export default function CategoryBtn({ category = '', initChecked = false, onClick }) {
  return (
    <label className={`${styles.category_btn} font_body_m_b`} onClick={onClick}>
      <input type='radio' name='category' value={category} defaultChecked={initChecked} />
      {category}
    </label>
  );
}
