'use client';

import { useEffect, useState } from 'react';
import styles from './DocumentOption.module.sass';
import OptionListItem from '../OptionListItem';
import { listMyDocuments } from '@backend/lib/api/documents';

export default function DocumentOption({
  title,
  type,
  selectedId,
  onSelect,
}) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { items } = await listMyDocuments({
          docType: type,
          page: 1,
        });

        setItems(items);
      } catch (error) {
        console.error(`${title} 조회 실패:`, error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [title, type]);

  return (
    <section className={`${styles.document_option} ${styles[type]}`}>
      <div className={styles.option_header}>
        <h3 className="font_body_l_b">{title}</h3>
      </div>

      <ul className={styles.option_list}>
        {isLoading ? (
          <li className="font_body_l_r">
            불러오는 중...
          </li>
        ) : error ? (
          <li className="font_body_l_r">
            {title}를 불러오지 못했습니다.
          </li>
        ) : items.length === 0 ? (
          <li className="font_body_l_r">
            등록된 {title}가 없습니다.
          </li>
        ) : (
          items.map((item) => (
            <OptionListItem
              key={item.id}
              title={item.title}
              type={type}
              isSelected={selectedId === item.id}
              onClick={() => onSelect(item.id)}
            />
          ))
        )}
      </ul>
    </section>
  );
}