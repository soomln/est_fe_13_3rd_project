import './FeatureCard.sass';

export default function FeatureCard({
  title,
  description,
}) {
  return (
    <article className="feature_card">
      <h3 className="font_body_l_b">{title}</h3>

      <p className="font_body_m_r">
        {description}
      </p>
    </article>
  );
}