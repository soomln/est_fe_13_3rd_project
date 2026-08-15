'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Tag from '../Tag';

import { createPortfolio, updatePortfolio, uploadPortfolioImage } from '@backend/lib/api/portfolio';

import styles from './SettingModal.module.sass';

export default function SettingModal({ item, setItem, isCreated, setIsCreated, isOpen, onClose }) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    thumbnailUrl: '',
    thumbnailFile: null,
    title: '',
    category: '',
    tags: [],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item || !isOpen) return;

    setForm({
      thumbnailUrl: item.thumbnailUrl || '',
      thumbnailFile: null,
      title: item.title || '',
      category: item.category || '',
      tags: item.tags || [],
    });

    setTagInput('');
  }, [item, isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const onUploadImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert('5MB 이하의 이미지만 업로드할 수 있습니다.');
      e.target.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setForm((prev) => {
      if (prev.thumbnailUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prev.thumbnailUrl);
      }

      return {
        ...prev,
        thumbnailUrl: imageUrl,
        thumbnailFile: file,
      };
    });

    e.target.value = '';
  };

  const handleRemoveThumbnail = () => {
    setForm((prev) => {
      if (prev.thumbnailUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prev.thumbnailUrl);
      }

      return {
        ...prev,
        thumbnailUrl: '',
        thumbnailFile: null,
      };
    });
  };

  const handleTagKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();

    const value = tagInput.trim();

    if (!value) return;
    if (form.tags.length >= 10) return;
    if (form.tags.includes(value)) return;

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, value],
    }));

    setTagInput('');
  };

  const handleRemoveTag = (targetTag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== targetTag),
    }));
  };

  const validateForm = (status) => {
    if (status === 'draft') return true;

    if (!form.thumbnailUrl) {
      alert('커버 이미지를 등록해주세요.');
      return false;
    }

    if (!form.title.trim()) {
      alert('제목을 입력해주세요.');
      return false;
    }

    if (!form.category) {
      alert('카테고리를 선택해주세요.');
      return false;
    }

    return true;
  };

  const savePortfolio = async (status) => {
    if (isSaving) return;
    if (!validateForm(status)) return;

    if (!item.authorId) {
      alert('사용자 정보를 불러오는 중입니다.');
      return;
    }

    try {
      setIsSaving(true);

      let thumbnailUrl = item.thumbnailUrl || '';

      if (form.thumbnailFile) {
        thumbnailUrl = await uploadPortfolioImage(item.id, form.thumbnailFile);
      } else if (!form.thumbnailUrl) {
        thumbnailUrl = '';
      }

      const portfolioData = {
        ...item,
        title: form.title.trim(),
        category: form.category,
        thumbnailUrl,
        tags: form.tags,
        status,
      };

      let savedItem;

      if (!isCreated) {
        savedItem = await createPortfolio(portfolioData);

        setIsCreated(true);
      } else {
        savedItem = await updatePortfolio(item.id, portfolioData);
      }

      const nextItem = {
        ...item,
        ...portfolioData,
        ...savedItem,

        // 현재 백엔드에서 tags를 반환하지 않으므로
        // 프론트 상태에서는 유지
        tags: form.tags,
      };

      setItem(nextItem);

      if (status === 'published') {
        router.replace('/portfolio');
        return;
      }

      onClose();
    } catch (error) {
      console.error('포트폴리오 저장 실패:', error);

      alert(status === 'draft' ? '임시저장에 실패했습니다.' : '업로드에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isOpen || !item) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.modalBox}>
        <header>
          <span className='font_h4'>설정</span>

          <button type='button' className={styles.close_btn} onClick={onClose}>
            <span className='material-symbols-outlined'>close</span>
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.body_left}>
            <div className={styles.thumnail_option}>
              <div className={`${styles.label} font_body_m_b`}>
                커버 이미지
                <span className={`${styles.required} font_body_m_b`}>(필수)</span>
              </div>

              <label className={styles.thumbnail}>
                {form.thumbnailUrl ? (
                  <>
                    <Image
                      src={form.thumbnailUrl}
                      alt='커버 이미지'
                      fill
                      unoptimized
                      className={styles.thumbnail_img}
                    />

                    <button
                      type='button'
                      className={styles.thumbnail_remove_btn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        handleRemoveThumbnail();
                      }}
                      aria-label='커버 이미지 삭제'
                    >
                      <span className='material-symbols-outlined'>close</span>
                    </button>
                  </>
                ) : (
                  <div className={styles.thumbnail_placeholder}>
                    <span className='material-symbols-outlined'>add_photo_alternate</span>

                    <span>이미지를 업로드해주세요.</span>
                  </div>
                )}

                <input type='file' accept='image/*' onChange={onUploadImage} />
              </label>

              <div className={`${styles.desc} font_body_s_b`}>
                커버 이미지 권장 비율은 5:4이며, 5MB 이상 파일은 업로드하실 수 없습니다.
              </div>
            </div>
          </div>

          <div className={styles.body_right}>
            <div className={styles.title_option}>
              <div className={`${styles.label} font_body_m_b`}>
                제목
                <span className={`${styles.required} font_body_m_b`}>(필수)</span>
              </div>

              <input
                type='text'
                className='font_body_s_b'
                placeholder='제목을 입력하세요'
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.category_option}>
              <div className={`${styles.label} font_body_m_b`}>
                카테고리
                <span className={`${styles.required} font_body_m_b`}>(필수)</span>
              </div>

              <div className={styles.category_group}>
                {['web', 'app'].map((category) => (
                  <label key={category} className={styles.category_item}>
                    <input
                      type='radio'
                      name='category'
                      value={category}
                      checked={form.category === category}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    />

                    <span className={styles.radio} />

                    <span className='font_body_s_b'>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.tag_option}>
              <div className={`${styles.label} font_body_m_b`}>태그</div>

              <input
                type='text'
                className='font_body_s_b'
                placeholder='Enter로 구분하여 입력해주세요. (최대 10개, 중복 X)'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />

              <div className={styles.tags}>
                {form.tags.map((tag) => (
                  <Tag key={tag} value={tag} onClick={handleRemoveTag} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer>
          <button
            type='button'
            className={`${styles.temp_save_btn} font_body_s_b`}
            onClick={() => savePortfolio('draft')}
            disabled={isSaving}
          >
            {isSaving ? '저장중...' : '임시저장'}
          </button>

          <button
            type='button'
            className={`${styles.upload_btn} font_body_s_b`}
            onClick={() => savePortfolio('published')}
            disabled={isSaving}
          >
            {isSaving ? '저장중...' : '업로드'}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
