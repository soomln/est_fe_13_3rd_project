'use client';

import styles from './PostFormShell.module.sass';

// 후기 / 족보 글쓰기 폼 껍데기
export default function PostFormShell({ title, description, isSubmitting, onCancel, onSubmit, children }) {
  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className={styles.form_body}>
        <div className={styles.form_head}>
          <h1 className='font_h1'>{title}</h1>
          <p className={`${styles.form_desc} font_body_l_r`}>{description}</p>
        </div>

        <div className={styles.form_fields}>
          <h2 className='font_h2'>평가 정보</h2>
          {children}
        </div>
      </div>

      <div className={styles.form_actions}>
        <button type='button' className={`${styles.form_cancel} font_body_l_b`} onClick={onCancel}>
          취소
        </button>

        <button type='submit' className={`${styles.form_submit} font_body_l_b`} disabled={isSubmitting}>
          작성 완료
        </button>
      </div>
    </form>
  );
}
