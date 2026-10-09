import { Badge, Button } from '../ui';
import styles from './NavigationBar.module.css';

interface NavigationBarProps {
  canGoBack: boolean;
  canGoNext: boolean;
  canSkip?: boolean;
  isLastQuestion: boolean;
  skippedCount: number;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function NavigationBar({
  canGoBack,
  canGoNext,
  canSkip = true,
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
      <Button variant="secondary" onClick={onSkip} disabled={!canSkip}>
        Saltar
        {skippedCount > 0 && <Badge variant="info">{skippedCount}</Badge>}
      </Button>
      <Button
        variant="primary"
        onClick={isLastQuestion ? onFinish : onNext}
        disabled={!isLastQuestion && !canGoNext}
      >
        {isLastQuestion ? 'Finalizar' : 'Siguiente →'}
      </Button>
    </div>
  );
}
