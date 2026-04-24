import { Headphones, Pause, Play, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

interface PomodoroBarProps {
  formattedTime: string;
  isActive: boolean;
  isSoundActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onToggleSound: () => void;
}

export default function PomodoroBar({
  formattedTime,
  isActive,
  isSoundActive,
  onToggle,
  onReset,
  onToggleSound,
}: PomodoroBarProps) {
  const { t } = useTranslation();

  return (
    <div
      data-pomodoro-shortcut="true"
      tabIndex={0}
      className="planner-pomodoro-bar flex items-center gap-2 sm:gap-3 bg-paper/90 border border-line rounded-full px-3 sm:px-4 py-2 shadow-lg dark:shadow-none backdrop-blur outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      aria-label={t('pomodoro_label')}
    >
      <div className="hidden sm:block text-[9px] uppercase font-bold tracking-widest text-ink/45">{t('pomodoro_label')}</div>
      <div className="font-serif italic font-bold text-accent text-lg w-14 text-center tabular-nums">
        {formattedTime}
      </div>
      <div className="h-4 w-px bg-line" />
      <button type="button" onClick={onToggle} className="text-ink hover:text-accent transition-colors" title={t('pomodoro_toggle')}>
        {isActive ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button type="button" onClick={onReset} className="text-ink hover:text-accent transition-colors" title={t('pomodoro_reset')}>
        <RotateCcw size={16} />
      </button>
      <button
        type="button"
        onClick={onToggleSound}
        className={cn('transition-colors', isSoundActive ? 'text-accent animate-pulse' : 'text-ink/45 hover:text-ink')}
        title={t('pomodoro_sound')}
      >
        <Headphones size={16} />
      </button>
    </div>
  );
}
