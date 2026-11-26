import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './modalMessage.module.css';

interface ModalProps {
  isOpen: boolean,
  title: string,
  children: ReactNode,
  onClose: () => void;
  className?: string;
}

export default function ModalMessage({
  isOpen,
  title,
  children,
  onClose,
  className = "",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <h2 id={titleId}>{title}</h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar janela"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
