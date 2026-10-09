import styles from './AnswerOption.module.css';

interface AnswerOptionProps {
  id: string;
  text: string;
  selected: boolean;
  correct?: boolean;
  annulled?: boolean;
  showResult?: boolean;
  index?: number;
  onClick: () => void;
}

export function AnswerOption({
  text,
  selected,
  correct,
  annulled,
  showResult,
  index = 0,
  onClick,
}: AnswerOptionProps) {
  const letter = String.fromCharCode(65 + index);

  const getClassName = () => {
    if (showResult && correct) return styles.correct;
    if (showResult && annulled) return selected ? styles.selected : '';
    if (showResult && selected && !correct) return styles.wrong;
    if (selected) return styles.selected;
    return '';
  };

  return (
    <button
      type="button"
      role="radio"
      className={`${styles.option} ${getClassName()}`}
      onClick={onClick}
      disabled={showResult}
      aria-checked={selected}
    >
      <span className={styles.bubble} aria-hidden="true">
        {letter}
      </span>
      <span className={styles.text}>{text}</span>
      {showResult && correct && (
        <>
          <span className={styles.icon} aria-hidden="true">
            ✓
          </span>
          <span className={styles.srOnly}>Respuesta correcta</span>
        </>
      )}
      {showResult && selected && !correct && !annulled && (
        <>
          <span className={styles.icon} aria-hidden="true">
            ✗
          </span>
          <span className={styles.srOnly}>Tu respuesta, incorrecta</span>
        </>
      )}
    </button>
  );
}
