'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Scrollbar, Autoplay, EffectCoverflow } from 'swiper/modules';

import styles from './page.module.sass';
import 'swiper/css';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-coverflow';

import Header from '@/app/_components/common/Header/Header';
import Footer from '@/app/_components/common/Footer/Footer';
import CategoryBtn from '@/app/portfolio/_components/CategoryBtn';
import SortBtn from '@/app/portfolio/_components/SortBtn/SortBtn';
import PortfolioCard from '@/app/_components/common/PortfolioCard';
import QuickBtns from './_components/QuickBtns';
import Window from '@/app/portfolio/_components/Modal/Window';

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
    { id: 8, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 9, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 10, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 11, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 12, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 13, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 14, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 15, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
  ];
  //================test================/

  const bestPortfolioList = [];
  items.map((item) => {
    bestPortfolioList.push(
      <SwiperSlide>
        <PortfolioCard key={item.id} item={item} onClick={() => {}} />
      </SwiperSlide>,
    );
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modalId = searchParams.get('modal');
  const selectedItem = items.find((item) => item.id === Number(modalId)) ?? null;
  const isModalOpen = !!selectedItem;

  const galleryRef = useRef(null);
  const [showQuickBtns, setShowQuickBtns] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const gallery = galleryRef.current;
      if (!gallery) return;

      const { top, bottom } = gallery.getBoundingClientRect();
      const isActive = top <= 0 && bottom > 0;
      setShowQuickBtns(isActive);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const onOpenDetail = (item) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('modal', item.id);

    router.push(`${pathname}?${params.toString()}`);
  };

  const onCloseDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modal');

    const queryString = params.toString();
    const cleanUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(cleanUrl);
  };

  const portfolioList = [];
  items.map((item) => {
    portfolioList.push(<PortfolioCard key={item.id} item={item} onClick={onOpenDetail} />);
  });

  const handleMoveTop = () => {
    galleryRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={`container ${styles.container}`}>
          <section className={`${styles.hero}`}>
            <Swiper
              className={`mySwiper ${styles.swiper_slider}`}
              modules={[Scrollbar, Autoplay, EffectCoverflow]}
              scrollbar={{
                hide: false,
              }}
              autoplay={{ delay: 3000, pauseOnMouseEnter: true }}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={2}
              coverflowEffect={{
                rotate: 0,
                stretch: 0, // 슬라이드 간 거리 (px)
                depth: 150,
                modifier: 2, // 효과 배율
                slideShadows: true, // 슬라이드 그림자 표시 여부
              }}
            >
              {bestPortfolioList}
            </Swiper>
          </section>
          <section className={styles.gallery} ref={galleryRef}>
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
            {showQuickBtns && <QuickBtns onMoveTop={handleMoveTop} />}
          </section>
        </div>

        <Window isOpen={isModalOpen} onClose={onCloseDetail} data={selectedItem} />

        <Footer />
      </main>
    </>
  );
}
