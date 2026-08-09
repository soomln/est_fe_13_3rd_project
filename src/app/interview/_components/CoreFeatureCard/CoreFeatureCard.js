import Image from 'next/image';
import './CoreFeatureCard.sass';

export default function CoreFeatureCard({
  title,
  description,
  features,
  image,
  variant = 'green',
}) {
  return (
    <article className={`core_feature_card ${variant}`}>
      <div className="feature_content">
        <h3 className="font_h3">
          {title}
        </h3>

        <p className="font_body_l_r">
          {description}
        </p>

        <ul className="feature_list">
          {features.map((feature) => (
            <li key={feature}>
              <span className="material-symbols-rounded">
                check
              </span>

              <span className="font_body_l_r">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="feature_image">
        <Image
          src={image}
          alt=""
          width={220}
          height={180}
        />
      </div>
    </article>
  );
}