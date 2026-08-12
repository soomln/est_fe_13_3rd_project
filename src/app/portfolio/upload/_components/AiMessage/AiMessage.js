import ReactMarkdown from 'react-markdown';

import styles from './AiMessage.module.sass';

export default function UserMessage({ id, message }) {
  return (
    <li key={id} className={styles.bubble}>
      <ReactMarkdown>{message}</ReactMarkdown>
    </li>
  );
}
