import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  ['Cmd/Ctrl + K', 'shortcut_add'],
  ['?', 'shortcut_help'],
  ['Space', 'shortcut_pomodoro'],
];

export default function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-ink/35 backdrop-blur-sm flex items-center justify-center p-4 print:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-3xl border border-line bg-paper p-6 shadow-2xl dark:shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-accent mb-2">PlannerOS</p>
                <h2 className="font-serif italic text-3xl text-ink">{t('shortcuts_title')}</h2>
              </div>
              <button type="button" onClick={onClose} className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:text-accent transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {shortcuts.map(([combo, labelKey]) => (
                <div key={combo} className="flex items-center justify-between gap-4 rounded-2xl bg-sidebar border border-line px-4 py-3">
                  <span className="text-sm text-ink/75">{t(labelKey)}</span>
                  <kbd className="rounded-lg border border-line bg-paper px-2.5 py-1 text-[11px] font-bold tracking-widest text-accent shadow-sm">{combo}</kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
