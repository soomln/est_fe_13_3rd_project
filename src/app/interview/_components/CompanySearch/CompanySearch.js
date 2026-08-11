import './CompanySearch.sass';

export default function CompanySearch() {
  const companies = [
    '삼성전자',
    '삼성전자',
    '삼성전자',
    '삼성전자',
    '삼성전자',
  ];

  return (
    <section className="company_search">
      <h3 className="font_body_l_b">기업 검색</h3>

      <div className="company_search_input">
        <span className="font_body_s_r">
          기업명을 입력하세요.
        </span>
        <button
          type="button"
          className="company_search_button"
          aria-label="기업 검색"
        >
          <span className="material-symbols-outlined">
            search
          </span>
        </button>
      </div>
      <ul className="company_list">
        {companies.map((company, index) => (
          <li
            key={index}
            className="company_list_item font_body_l_r"
          >
            <span className="material-symbols-outlined company_checkbox">
              check_box_outline_blank
            </span>

            <span>{company}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}