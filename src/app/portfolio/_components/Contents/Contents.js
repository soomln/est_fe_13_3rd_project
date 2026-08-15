'use client';

import { useCallback, useState } from 'react';

import styles from './Contents.module.sass';

import BlockRenderer from '@/app/portfolio/upload/_components/BlockRenderer';

export default function Contents({ item, setItem, contentsRef = null, isEditMode = false, updateBlock, removeBlock }) {
  const [focusBlockId, setFocusBlockId] = useState(null);

  const addBlockAfter = useCallback(
    (blockId, newBlock) => {
      if (!setItem) return;

      const newBlockId = crypto.randomUUID();

      setItem((prev) => {
        const index = prev.content.findIndex((block) => block.id === blockId);

        if (index === -1) {
          return prev;
        }

        const content = [...prev.content];

        content.splice(index + 1, 0, {
          id: newBlockId,
          ...newBlock,
        });

        return {
          ...prev,
          content,
        };
      });

      // 새로 만들어진 TextBlock에 포커스
      setFocusBlockId(newBlockId);
    },
    [setItem],
  );

  const clearFocusBlock = useCallback(() => {
    setFocusBlockId(null);
  }, []);

  return (
    <div
      ref={contentsRef}
      className={styles.container}
      style={{
        backgroundColor: item?.bgColor,
      }}
    >
      <div
        className={styles.contents}
        style={{
          gap: `${item?.gap}px`,
        }}
      >
        {item?.content?.map((block) => (
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
