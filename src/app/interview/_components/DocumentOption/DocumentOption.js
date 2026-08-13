'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/_components/auth';
import './DocumentOption.sass';
import OptionListItem from '../OptionListItem';
import { listMyDocuments } from '@backend/lib/api/documents';

export default function DocumentOption({
  title,
  type,
  selectedId,
  onSelect,
}) {
  const { isLoading, isLoggedIn, openLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      setIsDocumentLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        const { items } = await listMyDocuments({
          docType: type,
          page: 1,
        });
        setItems(items);
      } catch (error) {
        console.error(`${title} 조회 실패:`, error);
      } finally {
        setIsDocumentLoading(false);
      }
    };
    fetchDocuments();
  }, [isLoading, isLoggedIn, type, title]);

  if (!isLoggedIn && !isLoading) {
    return (
      <section className={`document_option ${type}`}>
        <div className="option_header">
          <h3 className="font_body_l_b">{title}</h3>
        </div>
        <button
          type="button"
          onClick={openLogin}
          className="document_login_button font_body_s_r"
        >
          로그인 후 {title}를 선택해주세요.
        </button>
      </section>
    );
  }

  return (
    <section className={`document_option ${type}`}>
      <div className="option_header">
        <h3 className="font_body_l_b">{title}</h3>
      </div>
      <ul className="option_list">
        {isDocumentLoading ? (
          <li className="font_body_l_r">불러오는 중...</li>
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