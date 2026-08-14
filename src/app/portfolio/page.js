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

import { listPortfolios } from '@backend/lib/api/portfolio';

export default function Portpolio() {
  const categoryList = ['all', 'web', 'app'];

  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [showQuickBtns, setShowQuickBtns] = useState(false);

  const galleryRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modalId = searchParams.get('modal');
  const selectedItemID = modalId;
  const isModalOpen = !!selectedItemID;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await listPortfolios({
          sort: 'latest',
          page: 1,
        });

        setItems(data.items);
      } catch (error) {
        console.error(error);
      }
    };

    fetchItems();
  }, []);

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

  const updateReactionCount = (portfolioId, field, amount) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === portfolioId
          ? {
              ...item,
              [field]: item[field] + amount,
            }
          : item,
      ),
    );
  };

  const handleMoveTop = () => {
    galleryRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const portfolioList = sortedItems.map((item) => (
    <PortfolioCard
      key={item.id}
      item={item}
      onClick={() => {
        onOpenDetail(item);
      }}
      updateReactionCount={updateReactionCount}
    />
  ));

  const bestPortfolioList = items.map((item) => (
    <SwiperSlide key={item.id}>
      <PortfolioCard
        item={item}
        onClick={() => {
          onOpenDetail(item);
        }}
        updateReactionCount={updateReactionCount}
      />
    </SwiperSlide>
  ));

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
              {bestPortfolioList}
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

            <ul className={styles.item_list}>{portfolioList}</ul>

            {showQuickBtns && <QuickBtns onMoveTop={handleMoveTop} />}
          </section>
        </div>

        <Window isOpen={isModalOpen} onClose={onCloseDetail} itemID={selectedItemID} />

        <Footer />
      </main>
    </>
  );
}
