import { useEffect, useId, useRef } from 'react';
import type { Question } from '../../types';
import { Badge } from '../ui';
import { AnswerOption } from './AnswerOption';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  question: Question;
  selectedAnswerId: string | null;
  showResult: boolean;
  onSelectAnswer?: (answerId: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswerId,
  showResult,
  onSelectAnswer,
}: QuestionCardProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const annulled =
    showResult && !question.answers.some((answer) => answer.correct);

  useEffect(() => {
    if (showResult) return;
    headingRef.current?.focus();
  }, [question.id, showResult]);

  return (
    <div className={styles.card} role="group" aria-labelledby={headingId}>
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className={styles.text}>
        {question.text}
      </h2>
      {annulled && (
        <p className={styles.annulled}>
          <Badge variant="warning">Anulada</Badge>
          <span>
            Esta pregunta no tiene respuesta correcta y no cuenta para la nota.
          </span>
        </p>
      )}
      <div
        className={styles.answers}
        role="radiogroup"
        aria-labelledby={headingId}
      >
        {question.answers.map((answer, index) => (
          <AnswerOption
            key={answer.id}
            index={index}
            id={answer.id}
            text={answer.text}
            selected={selectedAnswerId === answer.id}
            correct={answer.correct}
            annulled={annulled}
            showResult={showResult}
            onClick={() => onSelectAnswer?.(answer.id)}
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
