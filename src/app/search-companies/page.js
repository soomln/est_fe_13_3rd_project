import styles from './page.module.sass';
import Header from '../_components/common/Header';
import Footer from '../_components/common/Footer';
import Pagination from '../_components/common/Pagination';
import CompanyCard from './_components/CompanyCard';

const companies = [
    {
        id: 1,
        name: "이스트소프트",
        category: "IT / 소프트웨어",
        logo: "/images/estSoft 1.png",
    },
    {
        id: 2,
        name: "네이버",
        category: "플랫폼",
        logo: "/naver.png",
    },
    {
        id: 3,
        name: "토스",
        category: "핀테크",
        logo: "/naver.png",
    },
    {
        id: 4,
        name: "네이버",
        category: "플랫폼",
        logo: "/naver.png",
    },
    {
        id: 5,
        name: "네이버",
        category: "플랫폼",
        logo: "/naver.png",
    },
    {
        id: 6,
        name: "네이버",
        category: "플랫폼",
        logo: "/naver.png",
    },
    {
        id: 7,
        name: "네이버",
        category: "플랫폼",
        logo: "/naver.png",
    },
];

export default function SearchCompaniesPage() {
  return (
  <div>
  {/* 상단 공통 헤더 */}
    <Header/>
    <main className={styles.main}>
      {/* Hero */}
      <section className={`${styles.hero} flex flex-col items-center`}>
        <h1>어떤 <span>회사</span>가 궁금하신가요?</h1>
        <form>
          <input type='text' placeholder='회사명을 검색해보세요(ex. 네이버, 토스)'></input> 
          <button>🔍</button>
        </form>
        <div>
          <p>추천 검색어</p>
          <div>
            <button type='button'>#네이버</button>
            <button type='button'>#네이버</button>
            <button type='button'>#네이버</button>
          </div>
        </div>
      </section>

    <div className={styles.content}>
      {/* Filter */}
      <section className={styles.filter}>
          <div className={styles.filterHeader}>
              <h2>필터</h2>
              <button>초기화</button>
          </div>

          <div className={styles.filterGroup}>
              <h3>직무</h3>

              <label>
                  <input type="radio" name="job" />
                  전체
              </label>

              <label>
                  <input type="radio" name="job" />
                  프론트엔드
              </label>

              <label>
                  <input type="radio" name="job" />
                  백엔드
              </label>

              <button>더보기 +</button>
          </div>
          <hr/>
          <div className={styles.filterGroup}>
              <h3>기업 규모</h3>

              <label>
                  <input type="radio" name="job" />
                  전체
              </label>

              <label>
                  <input type="radio" name="job" />
                  스타트업
              </label>

              <label>
                  <input type="radio" name="job" />
                  대기업
              </label>
              <button>더보기 +</button>
          </div>
          <hr/>
          <div className={styles.filterGroup}>
              <h3>산업</h3>

              <label>
                  <input type="radio" name="job" />
                  IT 소프트웨어
              </label>

              <label>
                  <input type="radio" name="job" />
                  게임
              </label>

              <label>
                  <input type="radio" name="job" />
                  핀테크
              </label>
          </div>
      </section>

      {/* Company List */}
      <section className={styles.companyList}>
        {companies.map((company) => (
            <CompanyCard
                key={company.id}
                company={company}
            />
        ))}
      </section>
    </div>

      {/* Pagination */}
      <Pagination/>

    </main>
    {/* 하단 공통 풋터 */}
    <Footer/>
  </div>
  );
}
