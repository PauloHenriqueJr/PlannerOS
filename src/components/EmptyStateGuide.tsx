import { motion } from 'framer-motion';
import { Sparkles, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Example {
  labelKey: string;
  onClick: () => void;
}

interface Props {
  icon?: LucideIcon;
  whatKey?: string;
  howKey?: string;
  examples?: Example[];
  footer?: ReactNode;
}

export default function EmptyStateGuide({
  icon: Icon = Sparkles,
  whatKey,
  howKey,
  examples,
  footer,
}: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-dashed border-accent/40 bg-sidebar/70 p-5 sm:p-7 flex flex-col gap-4 shadow-inner"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-serif italic text-xl sm:text-2xl text-ink leading-tight">
            {t('empty_title')}
          </h3>
          {whatKey && (
            <p className="text-sm text-ink/75 leading-relaxed">{t(whatKey)}</p>
          )}
          {howKey && (
            <p className="text-sm text-ink/70 leading-relaxed">
              <span className="font-bold text-accent uppercase text-[10px] tracking-widest mr-2">
                {t('empty_how_label')}
              </span>
              {t(howKey)}
            </p>
          )}
        </div>
      </div>

      {examples && examples.length > 0 && (
        <div className="pt-3 border-t border-line">
          <div className="text-[10px] uppercase font-bold tracking-widest text-accent mb-3">
            {t('empty_examples_title')}
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex, i) => (
              <button
                key={`${ex.labelKey}-${i}`}
                type="button"
                onClick={ex.onClick}
                className="text-xs font-sans px-3 py-1.5 rounded-full border border-line bg-paper hover:border-accent hover:bg-accent/10 hover:text-accent transition-colors text-ink"
              >
                + {t(ex.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      {footer && <div className="pt-2">{footer}</div>}
    </motion.div>
  );
}
