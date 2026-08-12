import styles from './BlockManager.module.sass';

import TextBlock from '../TextBlock';
import ImageBlock from '../ImageBlock';
import VideoBlock from '../VideoBlock';
// import CodeBlock from '../CodeBlock';

export default function BlockManager({ block, isEditMode = false, updateBlock, removeBlock }) {
  console.log(block.type);
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} isEditMode={isEditMode} updateBlock={updateBlock} removeBlock={removeBlock} />;

    case 'image':
      return <ImageBlock block={block} isEditMode={isEditMode} updateBlock={updateBlock} removeBlock={removeBlock} />;

    case 'video':
      return <VideoBlock block={block} isEditMode={isEditMode} updateBlock={updateBlock} removeBlock={removeBlock} />;

    // case 'code':
    //   return <CodeBlock block={block} isEditMode={isEditMode} updateBlock={updateBlock} removeBlock={removeBlock} />;

    default:
      return null;
  }
}
