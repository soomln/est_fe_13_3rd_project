<section className="company_search">
  <h3>기업 검색</h3>

  <div className="search_box">
    <input
      type="text"
      placeholder="기업명을 입력하세요."
      className="font_body_s_r"
    />

    <button type="button" className="search_btn">
      <span className="material-symbols-rounded">
        search
      </span>
    </button>
  </div>

  <div className="company_list">
    {/* API 결과가 들어오는 곳 */}
  </div>
</section>