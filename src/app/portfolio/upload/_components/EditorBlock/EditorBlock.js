import styles from './EditorBlock.module.sass';

import TextBlock from '../TextBlock';
import ImageBlock from '../ImageBlock';
// import VideoBlock from '../VideoBlock';
// import CodeBlock from '../CodeBlock';

export default function EditorBlock({ block, updateBlock, removeBlock }) {
  switch (block.type) {
    case 'text':
      return <TextBlock block={block} updateBlock={updateBlock} removeBlock={removeBlock} />;

    case 'image':
      return <ImageBlock block={block} updateBlock={updateBlock} removeBlock={removeBlock} />;

    //   case 'video':
    //     return <VideoBlock block={block} updateBlock={updateBlock} removeBlock={removeBlock} />;

    //   case 'code':
    //     return <CodeBlock block={block} updateBlock={updateBlock} removeBlock={removeBlock} />;

    default:
      return null;
  }
}
