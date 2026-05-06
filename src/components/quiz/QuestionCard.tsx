import type { Question } from '../../types';
import { AnswerOption } from './AnswerOption';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  selectedAnswerId: string | null;
  showResult: boolean;
  onSelectAnswer: (answerId: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswerId,
  showResult,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className={styles.card}>
      <h2 className={styles.text}>{question.text}</h2>
      <div className={styles.answers}>
        {question.answers.map((answer) => (
          <AnswerOption
            key={answer.id}
            id={answer.id}
            text={answer.text}
            selected={selectedAnswerId === answer.id}
            correct={answer.correct}
            showResult={showResult}
            onClick={() => onSelectAnswer(answer.id)}
          />
        ))}
      </div>
      {showResult && question.explanation && (
        <div className={styles.explanation}>
          <strong>Explicación:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}