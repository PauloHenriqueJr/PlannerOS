import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ViewHeaderProps {
  title: string;
  subtitle?: string;
  detail?: string;
  descriptionKey?: string;
  actions?: ReactNode;
}

export default function ViewHeader({ title, subtitle, detail, descriptionKey, actions }: ViewHeaderProps) {
  const { t } = useTranslation();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 md:mb-10 gap-4 shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink leading-tight">{t(title)}</h1>
          {descriptionKey && (
            <div className="relative print:hidden">
              <button
                type="button"
                onClick={() => setIsHelpOpen((current) => !current)}
                onMouseEnter={() => setIsHelpOpen(true)}
                onMouseLeave={() => setIsHelpOpen(false)}
                className="w-8 h-8 rounded-full border border-line bg-sidebar/80 flex items-center justify-center text-ink/45 hover:text-accent hover:border-accent/50 transition-colors"
                aria-label={t('view_help')}
              >
                <HelpCircle size={15} />
              </button>
              <AnimatePresence>
                {isHelpOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-10 z-50 w-72 rounded-2xl border border-line bg-paper p-4 shadow-2xl dark:shadow-none"
                    onMouseEnter={() => setIsHelpOpen(true)}
                    onMouseLeave={() => setIsHelpOpen(false)}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-widest text-accent mb-2">{t('view_help')}</div>
                    <p className="text-sm leading-relaxed text-ink/75">{t(descriptionKey)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        {(subtitle || detail) && (
          <p className="text-xs md:text-sm opacity-50 mt-1">
            {detail ? `${detail} • ` : ''}{subtitle ? t(subtitle) : ''}
          </p>
        )}
      </div>
      {actions && <div className="print:hidden shrink-0">{actions}</div>}
    </div>
  );
}
