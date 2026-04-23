import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, usePurchases } from '../store';
import { ArrowRight, Crown, LayoutGrid, ShoppingBag, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { purchasedIds, products, isLoadingProducts } = usePurchases();
  const { t, i18n } = useTranslation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isPt = i18n.language.startsWith('pt');
  const isPro = purchasedIds.includes('pro');
  const purchasedProducts = isPro ? products : products.filter(p => purchasedIds.includes(p.id));
  const unpurchasedProducts = isPro ? [] : products.filter(p => !purchasedIds.includes(p.id)).slice(0, 3);
  const highlightedProduct = purchasedProducts[0];

  const copy = isPt
    ? {
        subtitle: 'Sua biblioteca pronta para hoje',
        introNoPlanners: 'Voce ainda nao desbloqueou nenhum planner. Comece com um template e monte seu sistema.',
        introWithPlanners: 'Escolha um planner para continuar de onde voce parou.',
        activePlan: 'Plano ativo',
        activePlanPro: 'Pro ativo',
        activePlanSingle: 'Avulso',
        available: 'Disponiveis',
        syncing: 'Sincronizando catalogo',
        openLast: 'Abrir ultimo planner',
        exploreTemplates: 'Explorar templates',
        unlockMore: 'Desbloqueie mais planners',
        unlockMoreDesc: 'Sugestoes com base no que voce ja adquiriu.',
        allUnlocked: 'Tudo desbloqueado',
        allUnlockedDesc: 'Seu plano Pro ja libera toda a biblioteca atual.',
      }
    : {
        subtitle: 'Your planner library, ready for today',
        introNoPlanners: "You have not unlocked any planners yet. Start with one template and build your system.",
        introWithPlanners: 'Pick a planner and continue where you left off.',
        activePlan: 'Active plan',
        activePlanPro: 'Pro active',
        activePlanSingle: 'Single access',
        available: 'Available',
        syncing: 'Syncing catalog',
        openLast: 'Open latest planner',
        exploreTemplates: 'Explore templates',
        unlockMore: 'Unlock more planners',
        unlockMoreDesc: 'Suggestions based on your current library.',
        allUnlocked: 'Everything unlocked',
        allUnlockedDesc: 'Your Pro plan already gives access to the full library.',
      };

  const formatPrice = (usd: number, brl: number) => {
    return isPt ? `R$ ${brl.toFixed(2).replace('.', ',')}` : `$${usd.toFixed(2)}`;
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 md:py-14">
      <section className="pb-10 border-b border-line">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-3">{t('my_overview')}</p>
            <h1 className="font-serif text-4xl md:text-5xl italic text-ink mb-3">{t('welcome_back', { name: user.name })}</h1>
            <p className="text-sm md:text-base text-ink/70 leading-relaxed max-w-2xl">
              {purchasedProducts.length === 0 ? copy.introNoPlanners : copy.introWithPlanners}
            </p>
            <p className="text-xs uppercase tracking-widest font-bold text-ink/45 mt-5">{copy.subtitle}</p>
          </div>

          <div className="border border-line bg-sidebar rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-4">{t('dashboard')}</p>
            <div className="flex flex-col gap-3">
              {highlightedProduct ? (
                <Link
                  to={`/planner/${highlightedProduct.id}`}
                  className="inline-flex items-center justify-between rounded-lg border border-line bg-paper px-4 py-3 text-xs uppercase tracking-widest font-bold text-ink hover:border-accent transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <LayoutGrid size={14} />
                    {copy.openLast}
                  </span>
                  <ArrowRight size={14} />
                </Link>
              ) : null}
              <Link
                to="/"
                className="inline-flex items-center justify-between rounded-lg border border-line bg-paper px-4 py-3 text-xs uppercase tracking-widest font-bold text-ink hover:border-accent transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag size={14} />
                  {copy.exploreTemplates}
                </span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mt-8">
          <div className="border border-line bg-sidebar rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink/55 mb-2">{t('owned')}</p>
            <p className="text-3xl font-serif italic">{purchasedProducts.length}</p>
          </div>
          <div className="border border-line bg-sidebar rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink/55 mb-2">{copy.available}</p>
            <p className="text-3xl font-serif italic">{isPro ? 0 : products.length - purchasedProducts.length}</p>
          </div>
          <div className="border border-line bg-sidebar rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-ink/55 mb-2">{copy.activePlan}</p>
            <p className="text-base font-semibold inline-flex items-center gap-2">
              <Crown size={16} className="text-accent" />
              {isPro ? copy.activePlanPro : copy.activePlanSingle}
            </p>
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="inline-flex items-center gap-2 mt-4 text-[10px] uppercase tracking-widest font-bold text-ink/50">
            <Sparkles size={14} className="text-accent" />
            {copy.syncing}
          </div>
        ) : null}
      </section>

      <section className="pt-10">
        {purchasedProducts.length === 0 ? (
          <div className="border border-line bg-sidebar rounded-lg px-6 py-14 text-center">
            <h2 className="font-serif text-3xl md:text-4xl italic mb-4">{t('no_planners')}</h2>
            <p className="max-w-2xl mx-auto text-ink/65 text-sm md:text-base leading-relaxed mb-8">{t('no_planners_desc')}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-accent text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <ShoppingBag size={14} />
              {t('browse_store')}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-serif text-3xl italic">{t('library')}</h2>
                <p className="text-sm text-ink/60 mt-1">{t('overview_title')}</p>
              </div>
              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold border border-line px-4 py-2 rounded-lg hover:border-accent transition-colors"
              >
                <ShoppingBag size={14} />
                {t('store_link')}
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedProducts.map(product => (
                <Link
                  key={product.id}
                  to={`/planner/${product.id}`}
                  className="group border border-line bg-sidebar rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image}
                      alt={t(product.nameKey as any)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {product.tagKey ? (
                      <span className="absolute top-3 left-3 bg-paper/90 backdrop-blur px-2.5 py-1 rounded text-[10px] uppercase tracking-widest font-bold text-accent">
                        {t(product.tagKey as any)}
                      </span>
                    ) : null}
                  </div>
                  <div className="p-5 flex flex-col min-h-52">
                    <h3 className="font-serif text-2xl leading-tight mb-2">{t(product.nameKey as any)}</h3>
                    <p className="text-sm text-ink/65 leading-relaxed flex-1">{t(product.descKey as any)}</p>
                    <div className="pt-4 mt-4 border-t border-line flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-accent">{t('open_planner')}</span>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-line group-hover:border-accent transition-colors">
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {isPro ? (
        <section className="pt-12 mt-12 border-t border-line">
          <div className="border border-line bg-sidebar rounded-lg p-6 md:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-2">{copy.allUnlocked}</p>
              <h3 className="font-serif text-3xl italic mb-1">{t('exclusive_access')}</h3>
              <p className="text-sm text-ink/65">{copy.allUnlockedDesc}</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold border border-line px-5 py-3 rounded-lg hover:border-accent transition-colors"
            >
              <ShoppingBag size={14} />
              {t('store_link')}
            </Link>
          </div>
        </section>
      ) : null}

      {unpurchasedProducts.length > 0 ? (
        <section className="pt-12 mt-12 border-t border-line">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-2">{copy.unlockMore}</p>
            <h3 className="font-serif text-3xl italic mb-1">{t('exclusive_access')}</h3>
            <p className="text-sm text-ink/65">{copy.unlockMoreDesc}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {unpurchasedProducts.map(product => (
              <Link
                key={product.id}
                to={`/checkout/${product.id}`}
                className="group border border-line bg-sidebar rounded-lg p-4 flex items-center gap-4 hover:border-accent transition-colors"
              >
                <img
                  src={product.image}
                  alt={t(product.nameKey as any)}
                  className="w-20 h-20 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">{t(product.tagKey as any)}</p>
                  <h4 className="font-serif text-xl leading-tight mb-1">{t(product.nameKey as any)}</h4>
                  <p className="text-xs text-ink/60">{formatPrice(product.priceUsd, product.priceBrl)}</p>
                </div>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-line group-hover:border-accent transition-colors shrink-0">
                  <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
