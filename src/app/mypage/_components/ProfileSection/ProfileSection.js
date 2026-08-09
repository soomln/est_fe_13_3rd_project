import styles from './ProfileSection.module.sass';

// 제목 + [수정] 이 붙는 흰 카드
export default function ProfileSection({ title, children }) {
  return (
    <section className={styles.profile_section}>
      <div className={styles.profile_section_head}>
        <h2 className={`${styles.profile_section_title} font_h3`}>{title}</h2>

        <button type='button' className={`${styles.profile_section_edit} font_body_l_b`}>
          수정
        </button>
      </div>

      {children}
    </section>
  );
}
