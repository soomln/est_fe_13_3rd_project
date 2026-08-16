'use client';

import { useState, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

import styles from './ImageView.module.sass';

const MIN_WIDTH = 60;

// 왼쪽 손잡이는 끌수록 작아지고 오른쪽 손잡이는 커진다
const CORNERS = [
  { key: 'nw', label: '왼쪽 위', dir: -1 },
  { key: 'ne', label: '오른쪽 위', dir: 1 },
  { key: 'sw', label: '왼쪽 아래', dir: -1 },
  { key: 'se', label: '오른쪽 아래', dir: 1 },
];

export default function ImageView({ node, updateAttributes, selected, editor }) {
  const wrapRef = useRef(null);
  const [isBroken, setIsBroken] = useState(false);

  const startResize = (event, dir) => {
    event.preventDefault();
    event.stopPropagation();

    const image = wrapRef.current?.querySelector('img');
    if (!image) return;

    const startX = event.clientX;
    const startWidth = image.offsetWidth;
    // 글자 취급이 되면서 바깥 상자가 span 이라 폭이 0 이다. 종이 폭을 직접 잰다
    const maxWidth = editor.view.dom.clientWidth || startWidth;
    // 화면 배율(50~150%)만큼 마우스 이동량과 실제 폭이 어긋난다
    const scale = image.getBoundingClientRect().width / startWidth || 1;

    const onMove = (moveEvent) => {
      const moved = ((moveEvent.clientX - startX) / scale) * dir;
      updateAttributes({
        width: Math.round(Math.min(maxWidth, Math.max(MIN_WIDTH, startWidth + moved))),
      });
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <NodeViewWrapper
      ref={wrapRef}
      as='span'
      className={`${styles.image_view} ${selected ? styles.image_view_on : ''}`}
    >
      <span className={styles.image_view_box}>
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ''}
          width={node.attrs.width ?? undefined}
          className={`${styles.image_view_img} ${isBroken ? styles.image_view_img_broken : ''}`}
          draggable
          data-drag-handle
          onError={() => setIsBroken(true)}
          onLoad={() => setIsBroken(false)}
        />

        {editor.isEditable &&
          CORNERS.map((corner) => (
            <span
              key={corner.key}
              className={`${styles.image_view_handle} ${styles[`image_view_handle_${corner.key}`]}`}
              onPointerDown={(event) => startResize(event, corner.dir)}
              onDragStart={(event) => event.preventDefault()}
              role='slider'
              tabIndex={-1}
              aria-label={`${corner.label} 모서리로 크기 조절`}
              aria-valuenow={node.attrs.width ?? 0}
            />
          ))}
      </span>
    </NodeViewWrapper>
  );
}
