import { type ReactNode } from 'react';
import { Header } from './Header';
import styles from './PageWrapper.module.css';

interface PageWrapperProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function PageWrapper({ children, showHeader = true }: PageWrapperProps) {
  return (
    <div className={styles.page}>
      {showHeader && <Header />}
      <div className={styles.glints} aria-hidden="true" />
      <a href="#main-content" className={styles.skipLink}>
        Saltar al contenido
      </a>
      <main id="main-content" tabIndex={-1} className={styles.content}>
        {children}
      </main>
    </div>
  );
}
