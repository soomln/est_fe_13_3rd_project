import styles from './CategoryBtn.module.sass';

export default function CategoryBtn({ category = '', initChecked = false }) {
  return (
    <label className={`${styles.category_btn} font_body_m_b`}>
      <input type='radio' name='category' value={category} defaultChecked={initChecked} />
      {category}
    </label>
  );
}
