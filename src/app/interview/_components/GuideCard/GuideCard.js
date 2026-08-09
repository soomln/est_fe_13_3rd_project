import './GuideCard.sass';

export default function GuideCard({
  icon,
  title,
  description,
}) {
  return (
    <article className="guide_card">
      <span className="material-symbols-rounded guide_icon">
        {icon}
      </span>

      <h3 className="font_body_m_b">
        {title}
      </h3>

      <p className="font_body_s_r">
        {description}
      </p>
    </article>
  );
}