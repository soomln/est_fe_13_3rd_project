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
import DetailModal from '@/app/portfolio/_components/DetailModal';

import { listPortfolios, getMyPortfolioReactions } from '@backend/lib/api/portfolio';

export default function Portpolio() {
  const categoryList = ['all', 'web', 'app'];

  const [items, setItems] = useState([]);
  const [bestPortfolioIds, setBestPortfolioIds] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');

  const galleryRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedItemID = searchParams.get('modal');
  const isModalOpen = !!selectedItemID;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await listPortfolios({
          sort: 'latest',
          page: 1,
        });

        const portfolioItems = data.items ?? [];

        if (portfolioItems.length === 0) {
          setItems([]);
          return;
        }

        const portfolioIds = portfolioItems.map((item) => item.id);

        let liked = new Set();
        let bookmarked = new Set();

        try {
          const reactions = await getMyPortfolioReactions(portfolioIds);

          liked = reactions.liked ?? new Set();
          bookmarked = reactions.bookmarked ?? new Set();
        } catch (error) {
          console.error('리액션 조회 실패:', error);
        }

        const itemsWithReactions = portfolioItems.map((item) => ({
          ...item,
          isLiked: liked.has(item.id),
          isBookmarked: bookmarked.has(item.id),
        }));

        setItems(itemsWithReactions);

        // 상단 Swiper는 최초 로딩 시에만 랜덤 6개 선택
        setBestPortfolioIds([...portfolioIds].sort(() => Math.random() - 0.5).slice(0, 6));
      } catch (error) {
        console.error('포트폴리오 조회 실패:', error);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter((item) => selectedCategory === 'all' || item.category === selectedCategory);

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (selectedSort) {
      case 'popular':
        return b.likeCount - a.likeCount;

      case 'bookmarks':
        return b.bookmarkCount - a.bookmarkCount;

      case 'latest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const bestPortfolioItems = bestPortfolioIds.map((id) => items.find((item) => item.id === id)).filter(Boolean);

  const selectedItem = items.find((item) => item.id === selectedItemID);

  const onOpenDetail = (item) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('modal', item.id);

    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const onCloseDetail = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('modal');

    const queryString = params.toString();
    const cleanUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(cleanUrl, {
      scroll: false,
    });
  };

  const updateReaction = (portfolioId, type, isActive) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== portfolioId) {
          return item;
        }

        if (type === 'like') {
          return {
            ...item,
            isLiked: isActive,
            likeCount: item.likeCount + (isActive ? 1 : -1),
          };
        }

        if (type === 'bookmark') {
          return {
            ...item,
            isBookmarked: isActive,
            bookmarkCount: item.bookmarkCount + (isActive ? 1 : -1),
          };
        }

        return item;
      }),
    );
  };

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
          <section className={styles.hero}>
            <Swiper
              className={`mySwiper ${styles.swiper_slider}`}
              modules={[Scrollbar, Autoplay, EffectCoverflow]}
              scrollbar={{
                hide: false,
              }}
              autoplay={{
                delay: 3000,
                pauseOnMouseEnter: true,
              }}
              effect='coverflow'
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={2}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 150,
                modifier: 2,
                slideShadows: true,
              }}
            >
              {bestPortfolioItems.map((item) => (
                <SwiperSlide key={item.id}>
                  <PortfolioCard item={item} onClick={onOpenDetail} updateReaction={updateReaction} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          <section className={styles.gallery} ref={galleryRef}>
            <div className={styles.btns_wrapper}>
              <div className={styles.radio_btns}>
                {categoryList.map((category) => (
                  <CategoryBtn
                    key={category}
                    category={category}
                    initChecked={category === 'all'}
                    onClick={() => {
                      setSelectedCategory(category);
                    }}
                  />
                ))}
              </div>

              <div className={styles.sort}>
                <SortBtn selectedSort={selectedSort} onChange={setSelectedSort} />
              </div>
            </div>

            <ul className={styles.item_list}>
              {sortedItems.map((item) => (
                <PortfolioCard key={item.id} item={item} onClick={onOpenDetail} updateReaction={updateReaction} />
              ))}
            </ul>

            <QuickBtns onMoveTop={handleMoveTop} />
          </section>
        </div>

        <DetailModal
          isOpen={isModalOpen}
          onClose={onCloseDetail}
          itemID={selectedItemID}
          isLiked={selectedItem?.isLiked ?? false}
          isBookmarked={selectedItem?.isBookmarked ?? false}
          updateReaction={updateReaction}
        />

        <Footer />
      </main>
    </>
  );
}
