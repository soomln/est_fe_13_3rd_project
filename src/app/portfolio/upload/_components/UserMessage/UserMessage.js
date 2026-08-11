import styles from './UserMessage.module.sass';

export default function UserMessage({ message }) {
  return <li className={styles.bubble}>{message}</li>;
}
