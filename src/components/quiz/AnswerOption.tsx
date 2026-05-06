import styles from './AnswerOption.module.css';

interface AnswerOptionProps {
  id: string;
  text: string;
  selected: boolean;
  correct?: boolean;
  showResult?: boolean;
  onClick: () => void;
}

export function AnswerOption({
  text,
  selected,
  correct,
  showResult,
  onClick,
}: AnswerOptionProps) {
  const getClassName = () => {
    if (showResult && correct) return styles.correct;
    if (showResult && selected && !correct) return styles.wrong;
    if (selected) return styles.selected;
    return '';
  };

  return (
    <button
      className={`${styles.option} ${getClassName()}`}
      onClick={onClick}
      disabled={showResult}
    >
      <span className={styles.text}>{text}</span>
      {showResult && correct && <span className={styles.icon}>✓</span>}
      {showResult && selected && !correct && <span className={styles.icon}>✗</span>}
    </button>
  );
}