import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui';
import styles from './ErrorBoundary.module.css';
import { PERSIST_KEY } from '../../stores/useQuizStore';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('QuizMind crashed:', error, info.componentStack);
  }

  private handleReset = () => {
    // El quiz persistido puede ser la causa del error: se descarta
    // para evitar un bucle de fallos al recargar.
    try {
      sessionStorage.removeItem(PERSIST_KEY);
    } catch {
      // sessionStorage no disponible: se ignora
    }
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback} role="alert">
          <h1 className={styles.title}>Algo ha ido mal</h1>
          <p className={styles.message}>
            La aplicación ha encontrado un error inesperado. Puedes volver al
            inicio; tu historial de tests completados se conserva.
          </p>
          <Button size="large" onClick={this.handleReset}>
            Volver al inicio
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
