import styles from './Tag.module.sass';

export default function Tag({ value, onClick }) {
  return (
    <div className={styles.tag}>
      <span className='font_body_s_b'>{value}</span>
      <button className='material-symbols-outlined' onClick={() => onClick(value)}>
        close
      </button>
    </div>
  );
}
