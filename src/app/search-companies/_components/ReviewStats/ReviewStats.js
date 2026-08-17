import DifficultyGauge from '@/app/search-companies/_components/DifficultyGauge';
import RatioList from '@/app/search-companies/_components/RatioList';
import RatioPie from '@/app/search-companies/_components/RatioPie';
import styles from './ReviewStats.module.sass';

// 면접 후기 통계 패널
export default function ReviewStats({ stats }) {
  return (
    <div className={styles.stats}>
      <div className={styles.stats_col}>
        <DifficultyGauge score={stats.difficultyAvg} grade={stats.difficultyGrade} />
        <RatioPie title='면접 경험' ratio={stats.experienceRatio} />
      </div>

      <div className={styles.stats_col}>
        <RatioList title='면접 경로' ratio={stats.channelRatio} />
        <RatioPie title='면접 결과' ratio={stats.resultRatio} />
      </div>
    </div>
  );
}
