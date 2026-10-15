import { type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AudioMenu } from '../settings/AudioMenu';
import { ThemeSelector } from '../settings/ThemeSelector';
import { WindowControls } from './WindowControls';
import styles from './Header.module.css';

interface HeaderProps {
  children?: ReactNode;
}

const LOGO_LETTERS = ['Q', 'u', 'i', 'z', 'M', 'i', 'n', 'd'];

export function Header({ children }: HeaderProps) {
  return (
    <header className={styles.header} data-tauri-drag-region="deep">
      <Link to="/" className={styles.logo} aria-label="QuizMind">
        {LOGO_LETTERS.map((letter, index) => (
          <span
            key={index}
            className={styles.logoLetter}
            style={{ '--letter-index': index } as CSSProperties}
            aria-hidden="true"
          >
            {letter}
          </span>
        ))}
      </Link>
      <div className={styles.actions}>
        {children}
        <AudioMenu />
        <ThemeSelector />
        <WindowControls />
      </div>
    </header>
  );
}
