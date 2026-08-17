'use client';

import { useRef } from 'react';
import styles from './ImageBlock.module.sass';

import Image from 'next/image';
import { uploadPortfolioImage } from '@backend/lib/api/portfolio';

export default function ImageBlock({ block, isEditMode = false, portfolioID, updateBlock, removeBlock }) {
  const uploadRef = useRef(null);

  const getImageSize = (file) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });

        URL.revokeObjectURL(objectUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('이미지 크기를 불러올 수 없습니다.'));
      };

      img.src = objectUrl;
    });
  };

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const { width, height } = await getImageSize(file);
      const imageUrl = await uploadPortfolioImage(portfolioID, file);

      updateBlock(block.id, {
        url: imageUrl,
        originalWidth: width,
        originalHeight: height,
        width: 100,
      });
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
    }
  };

  const startResize = (e) => {
    e.preventDefault();

    const parentWidth = uploadRef.current?.clientWidth;

    if (!parentWidth) return;

    const startX = e.clientX;
    const startWidthPercent = block.width ?? 100;

    const handlePointerMove = (e) => {
      const diff = e.clientX - startX;

      const diffPercent = (diff / parentWidth) * 100;

      const nextWidth = startWidthPercent + diffPercent;

      const width = Math.max(20, Math.min(nextWidth, 100));

      updateBlock(block.id, {
        width,
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className={styles.block}>
      <div ref={uploadRef} className={`${styles.upload} ${isEditMode ? styles.edit_mode : ''}`}>
        {block.url ? (
          <div
            className={styles.preview}
            style={{
              width: `${block.width ?? 100}%`,
            }}
          >
            <Image
              src={block.url}
              alt='포트폴리오 이미지'
              width={block.originalWidth}
              height={block.originalHeight}
              className={styles.img}
            />

            {isEditMode && (
              <button
                type='button'
                className={styles.resize_handle}
                onPointerDown={startResize}
                aria-label='이미지 크기 조절'
              />
            )}
          </div>
        ) : (
          <label className={styles.upload_label}>
            <div className='material-symbols-outlined'>add_photo_alternate</div>

            <div>이미지를 업로드해주세요.</div>

            <input type='file' accept='image/*' onChange={onUploadImage} />
          </label>
        )}

        {isEditMode && (
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
        )}
      </div>
    </div>
  );
}
