"use client"

import styles from '../page.module.sass';
import CompanyCard from './CompanyCard';
import { useEffect, useState } from 'react';
import { listCompanies } from '@backend/lib/api/companies';

const recommendedKeywords = [
  "네이버",
  "토스",
  "카카오",
];

export default function SearchCompaniesClient(){
  const [keyword, setKeyword] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [companies, setCompanies] = useState([]);

  const fetchCompanies = async (params = {}) => {
  const result = await listCompanies({
    q: keyword,
    jobRole,
    industry,
    size,
    ...params,
  });

  setCompanies(result.items);
  };

  useEffect(() => {
  async function fetchCompanies() {
    const result = await listCompanies();
    setCompanies(result.items);
  }

  fetchCompanies();
  }, []);

  const handleSearch = async (e) => {
  e.preventDefault();

  const result = await listCompanies({
    q: keyword,
  });

  setCompanies(result.items);
  };

  const handleRecommendedSearch = async (keyword) => {
  setKeyword(keyword);

  const result = await listCompanies({
    q: keyword,
    jobRole,
    industry,
    size,
  });

  setCompanies(result.items);
  };

  const handleReset = async () => {
  setKeyword("");
  setJobRole("");
  setIndustry("");
  setSize("");

  const result = await listCompanies();
  setCompanies(result.items);
  };

  const handleJobRoleChange = (e) => {
  const value = e.target.value;
  setJobRole(value);
  fetchCompanies({ job: value });
  };

  const handleSizeChange = (e) => {
  const value = e.target.value;
  setSize(value);
  fetchCompanies({ size: value });
  };

  const handleIndustryChange = (e) => {
  const value = e.target.value;
  setIndustry(value);
  fetchCompanies({ industry: value });
  };

  return (
    <div>
      {/* 상단 공통 헤더 */}
      
      <main className={styles.main}>
        {/* Hero */}
        <section className={`${styles.hero} flex flex-col items-center`}>
          <h1>
            어떤 <span>회사</span>가 궁금하신가요?
          </h1>
          <form onSubmit={handleSearch}>
            <input 
            type='text' 
            placeholder='회사명을 검색해보세요(ex. 네이버, 토스)'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}

            ></input>
            <button>🔍</button>
          </form>
          <div>
            <p>추천 검색어</p>
            {recommendedKeywords.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => handleRecommendedSearch(keyword)}
              >
                #{keyword}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.content}>
          {/* Filter */}
          <section className={styles.filter}>
            <div className={styles.filterHeader}>
              <h2>필터</h2>
              <button onClick={handleReset}>초기화</button>
            </div>

            <div className={styles.filterGroup}>
              <h3>직무</h3>

              <label>
                <input   
                type="radio"
                value=""
                checked={jobRole === ""}
                onChange={handleJobRoleChange}
                />
                전체
              </label>

              <label>
                <input   
                type="radio"
                value="frontend"
                checked={jobRole === "frontend"}
                onChange={handleJobRoleChange}
                />
                프론트엔드
              </label>

              <label>
                <input   
                type="radio"
                value="backend"
                checked={jobRole === "backend"}
                onChange={handleJobRoleChange}
                />
                백엔드
              </label>

              <button>더보기 +</button>
            </div>
            <hr />
            <div className={styles.filterGroup}>
              <h3>기업 규모</h3>

              <label>
                <input 
                type='radio' 
                value="" 
                checked={size === ""}
                onChange={handleSizeChange}/>
                전체
              </label>

              <label>
                <input 
                type='radio' 
                checked={size === "midsize"} 
                value="midsize" 
                onChange={handleSizeChange}/>
                중소/중견기업
              </label>

              <label>
                <input 
                type='radio' 
                checked={size === "large"}
                value="large" 
                onChange={handleSizeChange}/>
                대기업
              </label>
              <button>더보기 +</button>
            </div>
            <hr />
            <div className={styles.filterGroup}>
              <h3>산업</h3>

              <label>
                <input type='radio' 
                checked={industry === ""} 
                value="" 
                onChange={handleIndustryChange}/>
                전체
              </label>

              <label>
                <input 
                type='radio' 
                checked={industry === "it_software"}
                value="it_software" 
                onChange={handleIndustryChange}/>
                IT 소프트웨어
              </label>

              <label>
                <input 
                type='radio' 
                checked={industry === "game"}
                value="game" 
                onChange={handleIndustryChange}/>
                게임
              </label>

              <label>
                <input 
                type='radio' 
                checked={industry === "fintech"}
                value="fintech" 
                onChange={handleIndustryChange}/>
                핀테크
              </label>

              <label>
                <input 
                type='radio' 
                checked={industry === "platform"}
                value="platform" 
                onChange={handleIndustryChange}/>
                플랫폼·포털
              </label>

              <label>
                <input 
                type='radio' 
                checked={industry === "ecommerce"}
                value="ecommerce" 
                onChange={handleIndustryChange}/>
                이커머스
              </label>

              <label>
                <input 
                type='radio' 
                checked={industry === "security"}
                value="security" 
                onChange={handleIndustryChange}/>
                보안
              </label>
            </div>
          </section>

          {/* Company List */}
          <section className={styles.companyList}>
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}