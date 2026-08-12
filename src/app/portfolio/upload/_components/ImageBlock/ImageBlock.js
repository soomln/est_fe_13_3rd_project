import styles from './ImageBlock.module.sass';

export default function ImageBlock({ block, isEditMode = false, removeBlock }) {
  const onUploadImage = () => {};

  return (
    <div className={styles.block}>
      <div className={`${styles.upload} ${isEditMode ? styles.edit_mode : ''}`}>
        {block.url ? (
          <div className={styles.preview}>
            <img src={block.url} alt={block.alt || '업로드 이미지'} />
          </div>
        ) : (
          <label>
            <div className='material-symbols-outlined'>add_photo_alternate</div>
            <div>이미지를 업로드해주세요.</div>

            <input type='file' accept='image/*' onChange={onUploadImage} />
          </label>
        )}
      </div>
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
  );
}
