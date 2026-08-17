import styles from './SuggestionList.module.sass';

export default function SuggestionList({ suggestions, onSuggestionClick }) {
  return (
    <div className={styles.suggestions}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type='button'
          className={styles.suggestion}
          onClick={() => onSuggestionClick(suggestion)}
        >
          <span className='font_body_s_b'>{suggestion}</span>
        </button>
      ))}
    </div>
  );
}
