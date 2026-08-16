import Image from 'next/image';
import styles from './CoreFeatureCard.module.sass';

export default function CoreFeatureCard({
  title,
  description,
  features,
  image,
  variant = 'green',
}) {
  return (
    <article className={`${styles.core_feature_card} ${styles[variant]}`}>
      <div className={styles.feature_content}>
        <h3 className={`font_h3 ${styles.feature_title}`}>
          {title}
        </h3>

        <p className="font_body_l_r feature_description">
          {description}
        </p>

        <ul className={styles.feature_list}>
          {features.map((feature) => (
            <li key={feature}>
              <span className={`material-symbols-rounded ${styles.feature_check_icon}`}>
                check
              </span>

              <span className="font_body_l_r">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.feature_image}>
        <Image
          src={image}
          alt=""
          width={280}
          height={220}
        />
      </div>
    </article>
  );
}