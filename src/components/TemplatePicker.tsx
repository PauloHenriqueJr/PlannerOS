import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlannerTemplate } from '../lib/templates';

interface TemplatePickerProps {
  templates: PlannerTemplate[];
  onApply: (template: PlannerTemplate) => void;
}

export default function TemplatePicker({ templates, onApply }: TemplatePickerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (!templates.length) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-sm"
      >
        <Sparkles size={14} />
        {t('empty_use_template')}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-ink/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 print:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-line bg-paper p-6 shadow-2xl dark:shadow-none"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-accent mb-2">{t('templates_label')}</p>
                  <h2 className="font-serif italic text-3xl text-ink">{t('templates_title')}</h2>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:text-accent transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="grid gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      onApply(template);
                      setIsOpen(false);
                    }}
                    className="text-left rounded-2xl border border-line bg-sidebar p-4 hover:border-accent/60 hover:bg-accent/5 transition-colors"
                  >
                    <div className="font-serif italic text-xl text-ink mb-1">{t(template.labelKey)}</div>
                    <div className="text-xs text-ink/55">{t('templates_items', { count: template.items.length })}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
