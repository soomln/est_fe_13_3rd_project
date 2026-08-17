'use client';

import { useEffect, useState } from 'react';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

import styles from './OrderModal.module.sass';

function SortableItem({ block }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getBlockInfo = () => {
    switch (block.type) {
      case 'text':
        return {
          icon: 'text_fields',
          type: '텍스트',
          title: getTextPreview(block.html),
        };

      case 'image':
        return {
          icon: 'image',
          type: '이미지',
          title: block.alt || '이미지',
        };

      case 'video':
        return {
          icon: 'videocam',
          type: '동영상',
          title: block.url || '동영상',
        };

      case 'code':
        return {
          icon: 'code',
          type: '코드',
          title: block.filename || getCodePreview(block.code),
        };

      default:
        return {
          icon: 'widgets',
          type: '블록',
          title: '',
        };
    }
  };

  const blockInfo = getBlockInfo();

  return (
    <li ref={setNodeRef} style={style} className={`${styles.item} ${isDragging ? styles.dragging : ''}`}>
      <button type='button' className={styles.drag_btn} {...attributes} {...listeners} aria-label='블록 순서 이동'>
        <span className='material-symbols-outlined'>drag_indicator</span>
      </button>

      <div className={styles.thumbnail}>
        {block.type === 'image' && block.url ? (
          <img src={block.url} alt={block.alt || '이미지 미리보기'} className={styles.thumbnail_img} />
        ) : (
          <span className='material-symbols-outlined'>{blockInfo.icon}</span>
        )}
      </div>

      <div className={styles.info}>
        <strong className={`${styles.type} font_body_m_b`}>{blockInfo.type}</strong>

        {blockInfo.title && <span className={`${styles.preview} font_body_s`}>{blockInfo.title}</span>}
      </div>
    </li>
  );
}

function getTextPreview(html = '') {
  if (!html) return '내용이 없는 텍스트';

  const text = html.replace(/<[^>]*>/g, '').trim();

  return text || '내용이 없는 텍스트';
}

function getCodePreview(code = '') {
  if (!code) return '내용이 없는 코드';

  return code.split('\n')[0];
}

export default function OrderModal({ isOpen, onClose, blocks = [], onApply }) {
  const [sortedBlocks, setSortedBlocks] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    if (!isOpen) return;

    setSortedBlocks([...blocks]);
  }, [isOpen, blocks]);

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setSortedBlocks((prev) => {
      const oldIndex = prev.findIndex((block) => block.id === active.id);
      const newIndex = prev.findIndex((block) => block.id === over.id);

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleApply = () => {
    onApply(sortedBlocks);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.dimmed} onMouseDown={onClose}>
      <section className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <h2 className='font_h3'>콘텐츠 순서 변경</h2>
            <p className={`${styles.description} font_body_s`}>드래그하여 콘텐츠 순서를 변경할 수 있습니다.</p>
          </div>

          <button type='button' className={styles.close_btn} onClick={onClose} aria-label='닫기'>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </header>

        <div className={styles.content}>
          {sortedBlocks.length === 0 ? (
            <p className={`${styles.empty} font_body_m`}>순서를 변경할 콘텐츠가 없습니다.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortedBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                <ul className={styles.list}>
                  {sortedBlocks.map((block) => (
                    <SortableItem key={block.id} block={block} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <footer className={styles.footer}>
          <button type='button' className={`${styles.cancel_btn} font_body_m_b`} onClick={onClose}>
            취소
          </button>

          <button type='button' className={`${styles.apply_btn} font_body_m_b`} onClick={handleApply}>
            완료
          </button>
        </footer>
      </section>
    </div>
  );
}
