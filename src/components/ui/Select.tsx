import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Select({
  value,
  options,
  onChange,
  label,
  placeholder,
  disabled = false,
  id,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const elements =
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
    elements?.[activeIndex]?.focus();
  }, [open, activeIndex]);

  const openMenu = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const closeMenu = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    closeMenu();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        openMenu();
        break;
      case 'Home':
        event.preventDefault();
        openMenu(0);
        break;
      case 'End':
        event.preventDefault();
        openMenu(options.length - 1);
        break;
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (options[activeIndex]) handleSelect(options[activeIndex].value);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
        disabled={disabled}
      >
        <span className={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : (placeholder ?? label)}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          className={styles.menu}
          role="listbox"
          aria-label={label}
          onKeyDown={handleListKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              tabIndex={-1}
              className={`${styles.option} ${option.value === value ? styles.selected : ''} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className={styles.optionLabel}>{option.label}</span>
              {option.value === value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.check}
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
