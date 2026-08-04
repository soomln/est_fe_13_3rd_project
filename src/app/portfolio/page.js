'use client';
import styles from './page.module.sass';
import Header from '../_components/common/Header';
import Footer from '../_components/common/Footer';
import CategoryBtn from './_components/CategoryBtn';
import SortBtn from './_components/SortBtn';
import PortfolioCard from '../_components/common/PortfolioCard';

export default function Portpolio() {
  //================test================/
  const items = [
    { id: 1, thumbnailUrl: '', title: '포트폴리오 예시 1', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 2, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 3, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 4, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 5, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 6, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 7, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
  ];
  //================test================/

  const portfolioList = [];
  items.forEach((item) => {
    portfolioList.push(<PortfolioCard key={item.id} item={item} onClick={() => {}} />);
  });
  return (
    <main className={styles.page}>
      {/* <Header /> */}
      <div className='container'>
        <section className={styles.gallery}>
          <div className={styles.btns_wrapper}>
            <div className={styles.radio_btns}>
              <CategoryBtn category={'web'} initChecked={true} />
              <CategoryBtn category={'app'} />
            </div>
            <div className={`${styles.sort}`}>
              <SortBtn />
            </div>
          </div>
          <ul className={styles.item_list}>{portfolioList}</ul>
        </section>
      </div>
      <Footer />
    </main>
  );
}
