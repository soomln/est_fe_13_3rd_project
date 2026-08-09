import Link from 'next/link';

import styles from './DocumentRow.module.sass';

const TYPE_LABEL = { resume: '이력서', cover_letter: '자기소개서' };

export default function DocumentRow({ id, index, docType, title, updatedAt }) {
  const tone = docType === 'resume' ? 'green' : 'amber';

  return (
    <li className={styles.document_row}>
      <div className={styles.document_row_left}>
        <span className={`${styles.document_row_index} font_body_s_b`}>{index}</span>
        <span className={`${styles[`document_row_tag_${tone}`]} font_body_s_b`}>
          {TYPE_LABEL[docType]}
        </span>
        <span className={`${styles.document_row_title} font_body_l_b`}>{title}</span>
      </div>

      <div className={styles.document_row_right}>
        <span className={`${styles.document_row_date} font_body_s_b`}>{updatedAt}</span>

        <Link href={`/resume/editor?document=${id}`} className={`${styles.document_row_edit} font_body_l_b`}>
          <span className='material-symbols-sharp' aria-hidden='true'>
            edit
          </span>
          편집
        </Link>
      </div>
    </li>
  );
}
