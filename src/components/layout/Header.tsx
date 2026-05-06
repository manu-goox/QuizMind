import { type ReactNode } from 'react';
import { ThemeSelector } from '../settings/ThemeSelector';
import styles from './Header.module.css';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>QuizMind</div>
      <div className={styles.actions}>
        {children}
        <ThemeSelector />
      </div>
    </header>
  );
}