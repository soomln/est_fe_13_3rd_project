import { useState } from 'react';

import styles from './VideoBlock.module.sass';

export default function VideoBlock({ block, updateBlock, removeBlock }) {
  const [videoUrl, setVideoUrl] = useState(block.src || '');

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes('youtu.be')) {
        const videoId = parsedUrl.pathname.slice(1);

        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.hostname.includes('youtube.com')) {
        const videoId = parsedUrl.searchParams.get('v');

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      return '';
    } catch {
      return '';
    }
  };

  const onChangeVideoUrl = (e) => {
    const value = e.target.value;

    setVideoUrl(value);

    const embedUrl = getYoutubeEmbedUrl(value);

    if (embedUrl) {
      updateBlock({
        ...block,
        src: value,
      });
    }
  };

  const embedUrl = getYoutubeEmbedUrl(videoUrl);

  return (
    <div className={styles.block}>
      <div className={styles.upload}>
        {embedUrl ? (
          <iframe src={embedUrl} title='YouTube video' allowFullScreen />
        ) : (
          <label>
            <div className='material-symbols-sharp'>ondemand_video</div>
            <div className='font_body_m_r'>동영상 URL을 입력해주세요. ( YouTube 지원 )</div>
            <input
              type='url'
              className='font_body_m_r'
              placeholder='https://'
              value={videoUrl}
              onChange={onChangeVideoUrl}
            />
          </label>
        )}
      </div>

      <button
        type='button'
        className={styles.close_btn}
        onMouseDown={(e) => {
          e.preventDefault();
          removeBlock(block.id);
        }}
        aria-label='삭제'
      >
        <span className='material-symbols-sharp'>close</span>
      </button>
    </div>
  );
}
