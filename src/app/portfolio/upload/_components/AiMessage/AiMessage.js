import ReactMarkdown from 'react-markdown';

import styles from './AiMessage.module.sass';

export default function AiMessage({ message }) {
  return (
    <li className={styles.bubble}>
      <ReactMarkdown>{message}</ReactMarkdown>
    </li>
  );
}
