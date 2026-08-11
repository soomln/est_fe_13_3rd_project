import './DocumentOption.sass';

import OptionListItem from '../OptionListItem';

export default function DocumentOption({ title, type }) {
  const items = [
    '프론트엔드 개발자_최종',
    '프론트엔드 개발자_최종',
    '프론트엔드 개발자_최종',
    '프론트엔드 개발자_최종',
    '프론트엔드 개발자_최종',
  ];

  return (
    <section className={`document_option ${type}`}>
      <div className="option_header">
        <h3 className="font_body_l_b">{title}</h3>
      </div>

      <ul className="option_list">
        {items.map((item, index) => (
          <OptionListItem
            key={index}
            title={item}
            type={type}
          />
        ))}
      </ul>
    </section>
  );
}