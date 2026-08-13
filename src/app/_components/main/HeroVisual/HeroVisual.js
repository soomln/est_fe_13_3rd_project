import Image from 'next/image';
import styles from './HeroVisual.module.sass';

const QUESTION_CARD = {
  title: 'AI 예상 질문',
  position: '카카오 · 백엔드 포지션',
  questions: [
    '자기소개를 간단히 해주세요.',
    '가장 어려웠던 기술적 문제는?',
    '팀 갈등을 해결한 경험이 있나요?',
    'REST API 설계 원칙을 설명해주세요.',
  ],
  tags: ['자기소개', '기술 질문', '인성'],
  buttonLabel: 'AI 면접 연습하기',
};

const REVIEW_CARD = {
  title: '면접 후기',
  company: '카카오 백엔드 면접',
  desc: '자료구조 + 시스템 설계 위주...',
  date: '2일 전',
  badge: '🔥 인기 후기',
};

const PORTFOLIO_CARD = {
  title: '포트폴리오',
  project: '라운즈 리뉴얼 프로젝트',
  tags: ['HTML·CSS', 'JavaScript'],
  likes: '좋아요 52',
  views: '조회 320',
};

const TEAM_CARD = {
  title: '팀원 구하기',
  recruit: '프론트엔드 1명 구함',
  tags: ['React', 'TS'],
  status: '모집중',
  applicants: '지원자 3명',
};

const RESUME_CARD = {
  title: '이력서·자소서',
  metric: 'AI 서포트 활용도',
  percent: 98,
  rankLabel: '1위 질문',
  rankTag: '장·단점',
};

export default function HeroVisual() {
  return (
    <div className={styles.visual}>
      <div className={styles.glow} aria-hidden='true' />

      <div className={styles.decor} aria-hidden='true'>
        <div className={styles.pos_ring} style={{ animationDelay: '260ms' }}>
          <svg className={styles.ring_svg} viewBox='0 0 800 335'>
            <ellipse className={styles.ring_ellipse} cx='400' cy='167.5' rx='398' ry='165.5' />
          </svg>
        </div>

        <div className={styles.decor_enter} style={{ animationDelay: '320ms' }}>
          {[...Array(12)].map((_, i) => (
            <span key={`star-${i}`} className={`material-symbols-rounded ${styles.deco_star} ${styles[`star_${i}`]}`}>
              star
            </span>
          ))}
          {[...Array(9)].map((_, i) => (
            <span key={`dot-${i}`} className={`${styles.deco_dot} ${styles[`dot_${i}`]}`} />
          ))}
        </div>
      </div>

      <div className={`${styles.pos} ${styles.pos_review}`} style={{ animationDelay: '140ms' }}>
        <div className={`${styles.card} ${styles.float_review}`}>
          <div className={styles.mini_head}>
            <div className={`${styles.mini_icon} ${styles.icon_yellow}`}>
              <Image src='/images/hero/card-review.svg' alt='' width={16} height={16} />
            </div>
            <p className={`font_body_m_r ${styles.mini_title}`}>{REVIEW_CARD.title}</p>
          </div>
          <div className={styles.mini_pill}>
            <p className={`font_caption_b ${styles.mini_pill_text}`}>{REVIEW_CARD.company}</p>
          </div>
          <p className={`font_caption_b ${styles.mini_desc}`}>{REVIEW_CARD.desc}</p>
          <div className={styles.mini_footer}>
            <span className={`font_caption_b ${styles.footer_date}`}>{REVIEW_CARD.date}</span>
            <span className={`font_caption_b ${styles.footer_badge}`}>{REVIEW_CARD.badge}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.pos} ${styles.pos_qna}`} style={{ animationDelay: '0ms' }}>
        <div className={`${styles.card} ${styles.qna_inner}`}>
          <div className={styles.qna_head}>
            <div className={styles.qna_head_left}>
              <div className={styles.qna_icon}>
                <Image src='/images/hero/card-question.svg' alt='' width={20} height={20} />
              </div>
              <div>
                <p className={`font_body_s_b ${styles.qna_title}`}>{QUESTION_CARD.title}</p>
                <p className={`font_caption_b ${styles.qna_subtitle}`}>{QUESTION_CARD.position}</p>
              </div>
            </div>
            <span className={`font_caption_b ${styles.qna_new_badge}`}>NEW</span>
          </div>

          <div className={styles.qna_list}>
            {QUESTION_CARD.questions.map((q, i) => (
              <div key={q} className={styles.qna_item} style={{ animationDelay: `${-i * 3}s` }}>
                <span className={styles.qna_q}>Q</span>
                <p className={`font_caption_b ${styles.qna_question}`}>{q}</p>
              </div>
            ))}
          </div>

          <div className={styles.qna_tags}>
            {QUESTION_CARD.tags.map((tag) => (
              <span key={tag} className={`font_caption_b ${styles.qna_tag}`}>
                {tag}
              </span>
            ))}
          </div>

          <button type='button' className={`font_caption_b ${styles.qna_btn}`}>
            {QUESTION_CARD.buttonLabel}
          </button>
        </div>
      </div>

      <div className={`${styles.pos} ${styles.pos_portfolio}`} style={{ animationDelay: '160ms' }}>
        <div className={`${styles.card} ${styles.float_portfolio}`}>
          <div className={styles.mini_head}>
            <div className={`${styles.mini_icon} ${styles.icon_green}`}>
              <Image src='/images/hero/card-portfolio.svg' alt='' width={16} height={16} />
            </div>
            <p className={`font_body_m_r ${styles.mini_title}`}>{PORTFOLIO_CARD.title}</p>
          </div>
          <div className={styles.mini_pill}>
            <p className={`font_caption_b ${styles.mini_pill_text}`}>{PORTFOLIO_CARD.project}</p>
          </div>
          <div className={styles.tag_row}>
            {PORTFOLIO_CARD.tags.map((tag) => (
              <span key={tag} className={`font_caption_b ${styles.gray_tag}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className={`font_caption_b ${styles.meta_row}`}>
            <span>{PORTFOLIO_CARD.likes}</span>
            <span>{PORTFOLIO_CARD.views}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.pos} ${styles.pos_team}`} style={{ animationDelay: '180ms' }}>
        <div className={`${styles.card} ${styles.float_team}`}>
          <div className={styles.mini_head}>
            <div className={`${styles.mini_icon} ${styles.icon_purple}`}>
              <Image src='/images/hero/card-team.svg' alt='' width={16} height={16} />
            </div>
            <p className={`font_body_m_r ${styles.mini_title}`}>{TEAM_CARD.title}</p>
          </div>
          <div className={styles.team_recruit}>
            <span className={styles.purple_dot} />
            <p className={`font_caption_b ${styles.mini_desc_dark}`}>{TEAM_CARD.recruit}</p>
          </div>
          <div className={styles.tag_row}>
            {TEAM_CARD.tags.map((tag) => (
              <span key={tag} className={`font_caption_b ${styles.purple_tag}`}>
                {tag}
              </span>
            ))}
          </div>
          <div className={`font_caption_b ${styles.meta_row}`}>
            <span className={styles.status_green}>{TEAM_CARD.status}</span>
            <span>{TEAM_CARD.applicants}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.pos} ${styles.pos_resume}`} style={{ animationDelay: '200ms' }}>
        <div className={`${styles.card} ${styles.float_resume}`}>
          <div className={styles.mini_head}>
            <div className={`${styles.mini_icon} ${styles.icon_blue}`}>
              <Image src='/images/hero/card-resume.svg' alt='' width={16} height={16} />
            </div>
            <p className={`font_body_m_r ${styles.mini_title}`}>{RESUME_CARD.title}</p>
          </div>
          <div className={`font_caption_b ${styles.meta_row}`}>
            <span className={styles.meta_gray}>{RESUME_CARD.metric}</span>
            <span className={styles.status_green}>{RESUME_CARD.percent}%</span>
          </div>
          <div className={styles.progress_track}>
            <div className={styles.progress_fill} style={{ width: `${RESUME_CARD.percent}%` }} />
          </div>
          <div className={`font_caption_b ${styles.meta_row}`}>
            <span className={styles.meta_gray}>{RESUME_CARD.rankLabel}</span>
            <span className={styles.blue_tag}>{RESUME_CARD.rankTag}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
