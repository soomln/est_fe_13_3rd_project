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

import { listPortfolios } from '@backend/lib/api/portfolio';

export default function Portpolio() {
  const categoryList = ['all', 'web', 'app'];

  const [items, setItems] = useState([]);
  const [bestPortfolioItems, setBestPortfolioItems] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const galleryRef = useRef(null);
  const loadMoreRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedItemID = searchParams.get('modal');
  const isModalOpen = !!selectedItemID;

  useEffect(() => {
    let isCancelled = false;

    const fetchItems = async () => {
      try {
        setIsLoading(true);

        const data = await listPortfolios({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          sort: selectedSort,
          page,
        });

        if (isCancelled) {
          return;
        }

        const portfolioItems = data.items ?? [];

        const mappedItems = portfolioItems.map((item) => ({
          ...item,

          // 서버에서 이미 내려주는 값 사용
          isLiked: item.likedByMe ?? false,
          isBookmarked: item.bookmarkedByMe ?? false,
        }));

        setItems((prev) => {
          let nextItems;

          if (page === 1) {
            nextItems = mappedItems;
          } else {
            const existingIds = new Set(prev.map((item) => item.id));

            const newItems = mappedItems.filter((item) => !existingIds.has(item.id));

            nextItems = [...prev, ...newItems];
          }

          // 현재까지 불러온 개수가 전체 개수보다 적으면 다음 페이지 존재
          setHasMore(nextItems.length < (data.total ?? 0));

          return nextItems;
        });

        // 상단 Swiper는 최초 전체 최신순에서만 랜덤 6개 저장
        if (page === 1 && selectedCategory === 'all' && selectedSort === 'latest') {
          setBestPortfolioItems([...mappedItems].sort(() => Math.random() - 0.5).slice(0, 6));
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(`포트폴리오 ${page}페이지 조회 실패:`, error);

          setHasMore(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      isCancelled = true;
    };
  }, [page, selectedCategory, selectedSort]);

  // 무한 스크롤
  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || isLoading || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        // 같은 요소에서 page가 여러 번 증가하는 것 방지
        observer.unobserve(entry.target);

        setPage((prev) => prev + 1);
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [isLoading, hasMore, items.length]);

  const selectedItem = items.find((item) => item.id === selectedItemID);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) {
      return;
    }

    setItems([]);
    setPage(1);
    setHasMore(true);
    setSelectedCategory(category);
  };

  const handleSortChange = (sort) => {
    if (sort === selectedSort) {
      return;
    }

    setItems([]);
    setPage(1);
    setHasMore(true);
    setSelectedSort(sort);
  };

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
            likedByMe: isActive,
            likeCount: item.likeCount + (isActive ? 1 : -1),
          };
        }

        if (type === 'bookmark') {
          return {
            ...item,
            isBookmarked: isActive,
            bookmarkedByMe: isActive,
            bookmarkCount: item.bookmarkCount + (isActive ? 1 : -1),
          };
        }

        return item;
      }),
    );

    // Swiper 카드도 같이 갱신
    setBestPortfolioItems((prev) =>
      prev.map((item) => {
        if (item.id !== portfolioId) {
          return item;
        }

        if (type === 'like') {
          return {
            ...item,
            isLiked: isActive,
            likedByMe: isActive,
            likeCount: item.likeCount + (isActive ? 1 : -1),
          };
        }

        if (type === 'bookmark') {
          return {
            ...item,
            isBookmarked: isActive,
            bookmarkedByMe: isActive,
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
                      handleCategoryChange(category);
                    }}
                  />
                ))}
              </div>

              <div className={styles.sort}>
                <SortBtn selectedSort={selectedSort} onChange={handleSortChange} />
              </div>
            </div>

            <ul className={styles.item_list}>
              {items.map((item) => (
                <PortfolioCard key={item.id} item={item} onClick={onOpenDetail} updateReaction={updateReaction} />
              ))}
            </ul>

            {items.length > 0 && hasMore && !isLoading && <div ref={loadMoreRef} className={styles.load_more} />}

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
