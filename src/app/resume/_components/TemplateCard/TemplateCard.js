import Link from 'next/link';

import BookmarkBtn from '@/app/resume/_components/BookmarkBtn';
import PrimaryBtn from '@/app/resume/_components/PrimaryBtn';
import styles from './TemplateCard.module.sass';

export default function TemplateCard({ id, type, title, downloadCount, thumbnailUrl = '' }) {
  return (
    <li className={styles.template_card}>
      <Link href={`/resume/editor?template=${id}`} className={styles.template_card_link}>
        <div className={styles.template_card_top}>
          <div className={styles.template_card_thumb}>
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={`${title} 미리보기`} className={styles.template_card_thumb_img} />
            ) : (
              <div className={styles.template_card_thumb_empty}>
                <span className='material-symbols-sharp' aria-hidden='true'>
                  description
                </span>
              </div>
            )}
          </div>

          <div className={styles.template_card_overlay}>
            <PrimaryBtn as='span' label='작성하기' />
          </div>
        </div>

        <div className={styles.template_card_info}>
          <div className={styles.template_card_text}>
            <p className={`${styles.template_card_type} font_caption_b`}>{type}</p>
            <p className={`${styles.template_card_title} font_body_l_b`}>{title}</p>
          </div>
          <span className={`${styles.template_card_download} font_caption_b`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              download
            </span>
            {downloadCount.toLocaleString()}
          </span>
        </div>
      </Link>

      <div className={styles.template_card_bookmark}>
        <BookmarkBtn />
      </div>
    </li>
  );
}
