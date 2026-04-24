import { useTranslation } from 'react-i18next';

type LegalType = 'terms' | 'privacy' | 'refunds';

interface LegalPageProps {
  type: LegalType;
}

const sectionCounts: Record<LegalType, number> = {
  terms: 5,
  privacy: 5,
  refunds: 4,
};

export default function LegalPage({ type }: LegalPageProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-12 md:py-16">
      <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-3">
        {t('legal_eyebrow')}
      </p>
      <h1 className="font-serif italic text-4xl md:text-6xl text-ink mb-5">
        {t(`${type}_title`)}
      </h1>
      <p className="text-sm md:text-base leading-relaxed text-ink/65 mb-10">
        {t(`${type}_intro`)}
      </p>

      <div className="space-y-6">
        {Array.from({ length: sectionCounts[type] }, (_, index) => {
          const sectionNumber = index + 1;
          return (
            <section key={sectionNumber} className="border-t border-line pt-6">
              <h2 className="font-serif text-2xl italic text-ink mb-3">
                {t(`${type}_section_${sectionNumber}_title`)}
              </h2>
              <p className="text-sm leading-relaxed text-ink/70">
                {t(`${type}_section_${sectionNumber}_body`)}
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
