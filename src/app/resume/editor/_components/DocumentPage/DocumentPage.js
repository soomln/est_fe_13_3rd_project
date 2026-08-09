import styles from './DocumentPage.module.sass';

// A4 한 장
export default function DocumentPage({ html }) {
  return (
    <div
      className={styles.document_page}
      contentEditable
      suppressContentEditableWarning
      role='textbox'
      aria-multiline='true'
      aria-label='이력서 본문'
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
