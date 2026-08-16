'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Navigation, Pagination, Parallax } from 'swiper/modules';
import { listPortfolios } from '@backend/lib/api/portfolio';
import { PAGE_SIZE } from '@backend/lib/constants';
import { formatDate } from '@/utils/formatDate';

import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import 'swiper/css/parallax';

import styles from './PortfolioSlider.module.sass';

const CATEGORY_LABELS = {
  web: '웹',
  app: '앱',
};

const FALLBACK_COVER = '/images/main/portfolio-showcase.png';

function toSlide(item) {
  return {
    id: item.id,
    cover: item.thumbnailUrl || FALLBACK_COVER,
    title: item.title,
    author: [item.authorName, item.authorRole].filter(Boolean).join(' · '),
    badge: CATEGORY_LABELS[item.category] ?? '',
    date: formatDate(item.createdAt),
  };
}

export default function PortfolioSlider() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    listPortfolios({ sort: 'latest', pageSize: PAGE_SIZE.homePortfolios })
      .then(({ items: fetched }) => {
        if (cancelled) return;
        setItems(fetched.map(toSlide));
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') return null;

  if (status === 'error' || items.length === 0) {
    return <p className={`font_body_s_r ${styles.preview_empty}`}>포트폴리오를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>;
  }

  return (
    <div className={styles.preview}>
      <button ref={prevRef} type='button' className={`${styles.preview_nav} ${styles.preview_nav_prev}`} aria-label='이전 포트폴리오'>
        <span className='material-symbols-rounded' aria-hidden='true'>
          chevron_left
        </span>
      </button>
      <button ref={nextRef} type='button' className={`${styles.preview_nav} ${styles.preview_nav_next}`} aria-label='다음 포트폴리오'>
        <span className='material-symbols-rounded' aria-hidden='true'>
          chevron_right
        </span>
      </button>

      <Swiper
        className={styles.swiper}
        modules={[EffectCards, Navigation, Pagination, Parallax]}
        effect='cards'
        parallax
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
          <SwiperSlide key={item.id} className={styles.preview_card}>
            <div className={styles.preview_cover} data-swiper-parallax='-18%'>
              <Image
                src={item.cover}
                alt={`${item.title} 미리보기`}
                fill
                sizes='(max-width: 1439px) 100vw, 585px'
                className={styles.preview_cover_img}
              />
            </div>

            <div className={styles.preview_meta}>
              <div className={styles.preview_meta_top} data-swiper-parallax='-60'>
                <div>
                  <p className={`font_h4 ${styles.preview_name}`}>{item.title}</p>
                  <p className={`font_caption_b ${styles.preview_author}`}>{item.author}</p>
                </div>
                {item.badge && <span className={`font_caption_b ${styles.preview_badge}`}>{item.badge}</span>}
              </div>

              <div className={styles.preview_meta_bottom} data-swiper-parallax='-30'>
                <div className={styles.preview_tags} />
                <span className={`font_caption_b ${styles.preview_date}`}>{item.date}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
