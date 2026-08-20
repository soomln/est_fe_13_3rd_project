'use client';

import { useCallback, useState } from 'react';

import styles from './Contents.module.sass';

import BlockRenderer from '@/app/portfolio/upload/_components/BlockRenderer';

export default function Contents({
  item,
  setItem,
  activeTab,
  contentsRef = null,
  isEditMode = false,
  updateBlock,
  removeBlock,
}) {
  const [focusBlockId, setFocusBlockId] = useState(null);

  const addBlockAfter = useCallback(
    (blockId, newBlock) => {
      if (!setItem) return;

      const newBlockId = crypto.randomUUID();

      setItem((prev) => {
        const activeContent = prev[activeTab];
        const index = activeContent.findIndex((block) => block.id === blockId);

        if (index === -1) {
          return prev;
        }

        const updatedContent = [...activeContent];

        updatedContent.splice(index + 1, 0, {
          id: newBlockId,
          ...newBlock,
        });

        return {
          ...prev,
          [activeTab]: updatedContent,
        };
      });

      // 새로 만들어진 TextBlock에 포커스
      setFocusBlockId(newBlockId);
    },
    [setItem, activeTab],
  );

  const clearFocusBlock = useCallback(() => {
    setFocusBlockId(null);
  }, []);

  return (
    <div
      ref={contentsRef}
      className={`${!isEditMode ? 'container' : ''} ${styles.container}`}
      tabIndex={isEditMode ? undefined : -1}
      style={{
        backgroundColor: item?.bgColor,
      }}
    >
      <div
        className={styles.contents}
        style={{
          gap: `${item?.gapPx}px`,
        }}
      >
        {item[activeTab]?.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            isEditMode={isEditMode}
            portfolioID={item.id}
            updateBlock={updateBlock}
            removeBlock={removeBlock}
            addBlockAfter={addBlockAfter}
            focusBlockId={focusBlockId}
            clearFocusBlock={clearFocusBlock}
          />
        ))}
      </div>
    </div>
  );
}
