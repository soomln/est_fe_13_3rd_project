import Link from 'next/link';

import styles from './DocumentRow.module.sass';

const TYPE_LABEL = { resume: '이력서', cover_letter: '자기소개서' };

// onToggle 을 넘기면 삭제모드가 된다. 편집 버튼을 뺀 나머지 전체가 체크 영역
// 삭제모드가 아닐 때는 같은 영역이 미리보기 버튼이 된다
export default function DocumentRow({
  id,
  index,
  docType,
  title,
  updatedAt,
  isSelected = false,
  onToggle,
  onPreview,
  editHref,
  editLabel = '편집',
}) {
  const tone = docType === 'resume' ? 'green' : 'amber';
  const isPreviewable = !onToggle && Boolean(onPreview);
  const Body = onToggle ? 'label' : isPreviewable ? 'button' : 'div';

  return (
    <li className={`${styles.document_row} ${isSelected ? styles.document_row_selected : ''}`}>
      <Body
        type={isPreviewable ? 'button' : undefined}
        onClick={isPreviewable ? onPreview : undefined}
        className={`${styles.document_row_body} ${onToggle || isPreviewable ? styles.document_row_pickable : ''}`}
      >
        {onToggle && (
          <span className={styles.document_row_check}>
            <input
              type='checkbox'
              checked={isSelected}
              onChange={onToggle}
              aria-label={`${title} 선택`}
            />
            <span className='material-symbols-sharp' aria-hidden='true'>
              check
            </span>
          </span>
        )}

        <span className={`${styles.document_row_index} font_body_s_b`}>{index}</span>
        <span className={`${styles[`document_row_tag_${tone}`]} font_body_s_b`}>
          {TYPE_LABEL[docType]}
        </span>
        <span className={`${styles.document_row_title} font_body_l_b`}>{title}</span>
        <span className={`${styles.document_row_date} font_body_s_b`}>{updatedAt}</span>
      </Body>

      <Link
        href={editHref ?? `/resume/editor?document=${id}`}
        className={`${styles.document_row_edit} font_body_l_b`}
      >
        <span className='material-symbols-sharp' aria-hidden='true'>
          edit
        </span>
        {editLabel}
      </Link>
    </li>
  );
}
