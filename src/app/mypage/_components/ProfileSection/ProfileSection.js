import styles from './ProfileSection.module.sass';

// 제목 + [수정] 이 붙는 흰 카드. 수정 중에는 editChildren 과 [취소] [저장] 을 대신 보여준다
export default function ProfileSection({
  title,
  hideEdit = false,
  isEditing = false,
  onEdit,
  onCancel,
  onSave,
  editChildren,
  children,
}) {
  return (
    <section className={styles.profile_section}>
      <div className={styles.profile_section_head}>
        <h2 className={`${styles.profile_section_title} font_h3`}>{title}</h2>

        {!hideEdit &&
          (isEditing ? (
            <div className={styles.profile_section_actions}>
              <button
                type='button'
                className={`${styles.profile_section_cancel} font_body_l_b`}
                onClick={onCancel}
              >
                취소
              </button>
              <button
                type='button'
                className={`${styles.profile_section_save} font_body_l_b`}
                onClick={onSave}
              >
                저장
              </button>
            </div>
          ) : (
            <button
              type='button'
              className={`${styles.profile_section_edit} font_body_l_b`}
              onClick={onEdit}
            >
              수정
            </button>
          ))}
      </div>

      {isEditing ? editChildren : children}
    </section>
  );
}
