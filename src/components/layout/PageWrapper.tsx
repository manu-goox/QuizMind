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
      <main className={styles.content}>{children}</main>
    </div>
  );
}
