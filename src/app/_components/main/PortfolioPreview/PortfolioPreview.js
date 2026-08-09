'use client';

import styles from './PortfolioPreview.module.sass';
import PortfolioCard from '@/app/_components/common/PortfolioCard';

export default function PortfolioPreview({ item }) {
  return (
    <ul className={styles.portfolio_preview}>
      <PortfolioCard item={item} onClick={() => {}} />
    </ul>
  );
}
