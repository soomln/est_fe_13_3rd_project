import styles from './Contents.module.sass';

import BlockManager from '@/app/portfolio/upload/_components/BlockRenderer';

export default function Contents({ item, contentsRef = null, isEditMode = false, updateBlock, removeBlock }) {
  return (
    <div ref={contentsRef} className={styles.container} style={{ backgroundColor: item?.bgColor }}>
      <div className={styles.contents} style={{ gap: `${item?.gap}px` }}>
        {item?.content?.map((block, idx) => (
          <BlockManager
            key={block.id}
            block={block}
            isEditMode={isEditMode}
            updateBlock={updateBlock}
            removeBlock={removeBlock}
          />
        ))}
      </div>
    </div>
  );
}
