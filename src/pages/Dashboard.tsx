import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, usePurchases, PRODUCTS } from '../store';

export default function Dashboard() {
  const { user } = useAuth();
  const { purchasedIds } = usePurchases();
  const { t } = useTranslation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const purchasedProducts = PRODUCTS.filter(p => purchasedIds.includes(p.id));

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12 pb-6 md:pb-8 border-b border-line">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-2 md:mb-4">{t('my_overview')}</h3>
        <h1 className="font-serif text-3xl md:text-4xl italic text-ink">{t('welcome_back', { name: user.name })}</h1>
      </div>

      {purchasedProducts.length === 0 ? (
        <div className="text-center py-16 md:py-24 px-4 bg-white rounded-2xl md:rounded-[2rem] border border-line shadow-xl md:shadow-2xl">
          <p className="text-ink opacity-50 mb-6 text-sm md:text-base">{t('no_planners')}</p>
          <Link 
            to="/"
            className="inline-flex items-center text-[10px] uppercase tracking-widest font-bold bg-accent text-white px-6 py-3 rounded hover:opacity-90 transition-opacity"
          >
            {t('browse_store')}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {purchasedProducts.map(product => (
            <Link 
              key={product.id}
              to={`/planner/${product.id}`}
              className="group bg-white rounded-2xl border border-line p-6 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent transition-all duration-500 flex flex-col focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <div className="aspect-[4/3] bg-sidebar rounded-xl mb-6 overflow-hidden relative">
                <img 
                  src={product.image} 
                  alt={t(product.nameKey)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2 text-ink">{t(product.nameKey)}</h2>
              <p className="text-ink opacity-60 text-sm mb-6 flex-1 leading-relaxed">{t(product.descKey)}</p>
              <div className="text-[10px] uppercase tracking-widest font-bold text-accent group-hover:underline underline-offset-4">
                {t('open_planner')} &rarr;
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
