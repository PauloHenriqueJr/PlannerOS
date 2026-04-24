import { Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProgressWidgetProps {
  completed: number;
  total: number;
  percent: number;
}

export default function ProgressWidget({ completed, total, percent }: ProgressWidgetProps) {
  const { t } = useTranslation();

  return (
    <div className="planner-progress-widget hidden sm:flex items-center gap-3 rounded-2xl border border-line bg-paper/90 px-4 py-3 shadow-lg dark:shadow-none backdrop-blur min-w-[220px]">
      <div className="planner-progress-icon w-9 h-9 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent shrink-0">
        <Target size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-ink/55">{t('progress_today')}</span>
          <span className="text-[11px] font-bold text-accent tabular-nums">{completed}/{total}</span>
        </div>
        <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
