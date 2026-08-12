'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Navigation, Pagination, Parallax } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import 'swiper/css/parallax';

import styles from './PortfolioSlider.module.sass';

const TAG_COLORS = {
  React: 'blue',
  Tailwind: 'cyan',
};

export default function PortfolioSlider({ items }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

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
          <SwiperSlide key={item.title} className={styles.preview_card}>
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
                <span className={`font_caption_b ${styles.preview_badge}`}>{item.badge}</span>
              </div>

              <div className={styles.preview_meta_bottom} data-swiper-parallax='-30'>
                <div className={styles.preview_tags}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={`${styles.preview_tag} ${styles[`tag_${TAG_COLORS[tag] ?? 'gray'}`]}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <span className={`font_caption_b ${styles.preview_date}`}>{item.date}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
