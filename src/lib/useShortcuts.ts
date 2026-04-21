import { useEffect } from 'react';

interface ShortcutOptions {
  onAdd: () => void;
  onHelp: () => void;
  onPomodoroToggle: () => void;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}

export function useShortcuts({ onAdd, onHelp, onPomodoroToggle }: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        onAdd();
        return;
      }

      if (key === '?' && !isTypingTarget(event.target)) {
        event.preventDefault();
        onHelp();
        return;
      }

      if (event.code === 'Space') {
        const target = event.target;
        const isPomodoroControl = target instanceof HTMLElement && !!target.closest('[data-pomodoro-shortcut="true"]');
        if (isPomodoroControl) {
          event.preventDefault();
          onPomodoroToggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAdd, onHelp, onPomodoroToggle]);
}
