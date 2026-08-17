import styles from './BlockRenderer.module.sass';

import TextBlock from '../TextBlock';
import ImageBlock from '../ImageBlock';
import VideoBlock from '../VideoBlock';
import CodeBlock from '../CodeBlock';

export default function BlockRenderer({
  block,
  isEditMode = false,
  portfolioID,
  updateBlock,
  removeBlock,
  addBlockAfter,
  focusBlockId,
  clearFocusBlock,
}) {
  switch (block.type) {
    case 'text':
      return (
        <TextBlock
          block={block}
          isEditMode={isEditMode}
          updateBlock={updateBlock}
          removeBlock={removeBlock}
          addBlockAfter={addBlockAfter}
          shouldFocus={focusBlockId === block.id}
          onFocusComplete={clearFocusBlock}
        />
      );

    case 'image':
      return (
        <ImageBlock
          block={block}
          isEditMode={isEditMode}
          portfolioID={portfolioID}
          updateBlock={updateBlock}
          removeBlock={removeBlock}
        />
      );

    case 'video':
      return <VideoBlock block={block} isEditMode={isEditMode} updateBlock={updateBlock} removeBlock={removeBlock} />;

    case 'code':
      return <CodeBlock block={block} isEditMode={isEditMode} updateBlock={updateBlock} removeBlock={removeBlock} />;

    default:
      return null;
  }
}
