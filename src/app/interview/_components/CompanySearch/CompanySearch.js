'use client';

import { useEffect, useState } from 'react';
import './CompanySearch.sass';
import { listCompanies } from '@backend/lib/api/companies';

export default function CompanySearch({
  selectedId,
  onSelect,
}) {
  const [companies, setCompanies] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { items } = await listCompanies({
          page: 1,
          pageSize: 20,
        });
        setCompanies(items);
      } catch (error) {
        console.error('기업 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleSearch = async () => {
    const trimmedKeyword = keyword.trim();
    setSearchKeyword(trimmedKeyword);
    setIsLoading(true);
    try {
      const { items } = await listCompanies({
        q: trimmedKeyword,
        page: 1,
        pageSize: 20,
      });
      setCompanies(items);
    } catch (error) {
      console.error('기업 검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="company_search">
      <h3 className="font_body_l_b">기업 검색</h3>
      <div className="company_search_input">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          placeholder="기업명을 입력하세요."
          className="font_body_s_r"
        />
        <button
          type="button"
          className="company_search_button"
          aria-label="기업 검색"
          onClick={handleSearch}
        >
          <span className="material-symbols-outlined">
            search
          </span>
        </button>
      </div>
      <ul className="company_list">
        {isLoading ? (
          <li className="company_list_item font_body_l_r">
            불러오는 중...
          </li>
        ) : companies.length === 0 ? (
          <li className="company_list_item font_body_l_r">
            {searchKeyword
              ? '검색 결과가 없습니다.'
              : '등록된 기업이 없습니다.'}
          </li>
        ) : (
          companies.map((company) => {
            const isSelected = selectedId === company.id;

            return (
              <li
                key={company.id}
                className={`company_list_item font_body_l_r ${
                  isSelected ? 'is_selected' : ''
                }`}
                onClick={() => onSelect(company.id, company)}
              >
                <span className="material-symbols-outlined company_checkbox">
                  {isSelected
                    ? 'check_box'
                    : 'check_box_outline_blank'}
                </span>
                <span>{company.name}</span>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}