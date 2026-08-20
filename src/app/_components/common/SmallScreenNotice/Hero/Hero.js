import Confetti from '@/app/_components/common/SmallScreenNotice/Confetti';
import styles from './Hero.module.sass';

const STEPS = [
  { step: '01', title: '이력서·자소서 작성', tone: 'green' },
  { step: '02', title: 'AI 면접 연습', tone: 'amber' },
  { step: '03', title: '포트폴리오 전시', tone: 'purple' },
  { step: '04', title: '기업 탐색', tone: 'blue' },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={`${styles.hero_title} font_h2`}>개발자 취업 준비를 한 번에</h1>
      <p className={`${styles.hero_desc} font_body_m_r`}>
        이력서부터 면접까지
        <br />
        혼자하던 취업 준비를 <span className={styles.hero_brand}>CallBack</span>과 함께해요.
      </p>

      <div className={styles.hero_visual}>
        {/* 1280px 이상에서는 이 안내가 숨겨진다. lazy 여야 그때 안 받는다 */}
        <img
          src='/images/small-screen-notice/hero.png'
          alt=''
          className={styles.hero_img}
          loading='lazy'
          decoding='async'
        />
        <Confetti />
      </div>

      <ul className={styles.hero_steps}>
        {STEPS.map((item) => (
          <li key={item.step} className={`${styles.step} ${styles[`step_${item.tone}`]}`}>
            <span className={`${styles.step_num} font_body_s_b`}>{item.step}</span>
            <p className={`${styles.step_title} font_body_m_b`}>{item.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
