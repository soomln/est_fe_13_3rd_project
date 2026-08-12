import ShotMock from '@/app/_components/common/SmallScreenNotice/ShotMock';
import styles from './FeatureSection.module.sass';

export default function FeatureSection({ tone, icon, tag, title, desc, mock }) {
  return (
    <section className={`${styles.feature} ${styles[`feature_${tone}`]}`}>
      <div className={styles.feature_head}>
        <span className={`material-symbols-rounded ${styles.feature_icon}`}>{icon}</span>
        <span className={`${styles.feature_tag} font_body_s_b`}>{tag}</span>
      </div>

      <h2 className={`${styles.feature_title} font_h3`}>{title}</h2>
      <p className={`${styles.feature_desc} font_body_m_r`}>{desc}</p>

      <ShotMock kind={mock} />
    </section>
  );
}
