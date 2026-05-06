import { Button } from '../ui';
import styles from './NavigationBar.module.css';

interface NavigationBarProps {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastQuestion: boolean;
  skippedCount: number;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function NavigationBar({
  canGoBack,
  isLastQuestion,
  skippedCount,
  onBack,
  onSkip,
  onNext,
  onFinish,
}: NavigationBarProps) {
  return (
    <div className={styles.bar}>
      <Button variant="ghost" onClick={onBack} disabled={!canGoBack}>
        ← Anterior
      </Button>
      <Button variant="secondary" onClick={onSkip}>
        Saltar {skippedCount > 0 && <span className={styles.badge}>{skippedCount}</span>}
      </Button>
      <Button variant="primary" onClick={isLastQuestion ? onFinish : onNext}>
        {isLastQuestion ? 'Finalizar' : 'Siguiente →'}
      </Button>
    </div>
  );
}