'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Navigation, Pagination } from 'swiper/modules';
import { listPortfolios } from '@backend/lib/api/portfolio';
import { PAGE_SIZE } from '@backend/lib/constants';
import PortfolioCard from '@/app/_components/common/PortfolioCard';

import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';

import styles from './PortfolioSlider.module.sass';

export default function PortfolioSlider() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    listPortfolios({ sort: 'latest', pageSize: PAGE_SIZE.homePortfolios })
      .then(({ items: fetched }) => {
        if (cancelled) return;
        setItems(fetched);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateReactionCount = (portfolioId, field, amount) => {
    setItems((prev) =>
      prev.map((item) => (item.id === portfolioId ? { ...item, [field]: item[field] + amount } : item)),
    );
  };

  if (status === 'loading') return null;

  if (status === 'error' || items.length === 0) {
    return (
      <p className={`font_body_s_r ${styles.preview_empty}`}>
        포트폴리오를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  return (
    <div className={styles.preview}>
      <button
        ref={prevRef}
        type='button'
        className={`${styles.preview_nav} ${styles.preview_nav_prev}`}
        aria-label='이전 포트폴리오'
      >
        <span className='material-symbols-rounded' aria-hidden='true'>
          chevron_left
        </span>
      </button>
      <button
        ref={nextRef}
        type='button'
        className={`${styles.preview_nav} ${styles.preview_nav_next}`}
        aria-label='다음 포트폴리오'
      >
        <span className='material-symbols-rounded' aria-hidden='true'>
          chevron_right
        </span>
      </button>

      <Swiper
        wrapperTag='ul'
        className={styles.swiper}
        modules={[EffectCards, Navigation, Pagination]}
        effect='cards'
        grabCursor
        cardsEffect={{ perSlideOffset: 8, perSlideRotate: 2, slideShadows: false }}
        navigation
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        pagination={{ clickable: true, bulletClass: styles.dot, bulletActiveClass: styles.dot_active }}
      >
        {items.map((item) => (
          <SwiperSlide tag='li' key={item.id}>
            <PortfolioCard
              item={item}
              onClick={() => router.push(`/portfolio?modal=${item.id}`)}
              updateReactionCount={updateReactionCount}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
