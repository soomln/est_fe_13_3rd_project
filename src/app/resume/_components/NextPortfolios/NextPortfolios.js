'use client';

import { useEffect, useState } from 'react';

import { listPortfolios } from '@backend/lib/api/portfolio';
import styles from './NextPortfolios.module.sass';

// 카드 안에 몇 줄만 보여준다
const SIZE = 3;

export default function NextPortfolios() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;

    listPortfolios({ sort: 'popular', pageSize: SIZE })
      .then((result) => {
        if (alive) setItems(result?.items ?? []);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return items.map((item) => (
    <div key={item.id} className={styles.next_portfolio}>
      <p className={styles.next_portfolio_name}>{item.title}</p>

      <span className={styles.next_portfolio_like}>
        <span className='material-symbols-sharp' aria-hidden='true'>
          favorite
        </span>
        {item.likeCount}
      </span>
    </div>
  ));
}
