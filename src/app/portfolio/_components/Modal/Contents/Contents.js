import styles from './Contents.module.sass';

import EditorBlock from '@/app/portfolio/upload/_components/EditorBlock';

export default function Contents({
  bgColor = '#ffffff',
  gap = '1rem',
  contentsRef = null,
  blocks = [],
  updateBlock,
  removeBlock,
}) {
  return (
    <div ref={contentsRef} className={`${styles.container}`} style={{ backgroundColor: bgColor }}>
      <div className={`${styles.contents}`} style={{ gap: `${gap}px` }}>
        {blocks.map((block) => (
          <EditorBlock key={block.id} block={block} updateBlock={updateBlock} removeBlock={removeBlock} />
        ))}
      </div>
    </div>
  );
}
