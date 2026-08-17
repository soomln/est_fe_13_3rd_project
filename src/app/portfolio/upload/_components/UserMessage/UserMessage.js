import styles from './UserMessage.module.sass';

export default function UserMessage({ message }) {
  return <li className={`${styles.bubble} font_body_m_s`}>{message}</li>;
}
