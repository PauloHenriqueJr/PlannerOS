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
  const unpurchasedProducts = PRODUCTS.filter(p => !purchasedIds.includes(p.id)).slice(0, 3); // Show top 3

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-12 md:py-16">
      <div className="mb-12 md:mb-16 pb-8 border-b border-line flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-3">{t('my_overview')}</h3>
           <h1 className="font-serif text-4xl md:text-5xl italic text-ink">{t('welcome_back', { name: user.name })}</h1>
        </div>
        {purchasedProducts.length > 0 && (
          <div className="bg-sidebar px-4 py-2 rounded-lg border border-line shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
               {purchasedProducts.length} {t('owned')}
             </span>
          </div>
        )}
      </div>

      {purchasedProducts.length === 0 ? (
        <div className="relative overflow-hidden text-center py-24 md:py-32 px-4 bg-sidebar rounded-[2rem] border border-line shadow-2xl group">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sidebar to-transparent opacity-50"></div>
          <div className="relative z-10 max-w-lg mx-auto">
             <div className="w-20 h-20 bg-sidebar border border-line rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             </div>
             <h2 className="font-serif text-3xl font-bold mb-4">{t('no_planners')}</h2>
             <p className="text-ink opacity-60 mb-10 leading-relaxed">
               {t('no_planners_desc')}
             </p>
             <Link 
               to="/"
               className="inline-flex items-center text-xs uppercase tracking-widest font-bold bg-accent text-white px-8 py-4 rounded-lg hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-accent/20"
             >
               {t('browse_store')}
             </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {purchasedProducts.map(product => (
            <Link 
              key={product.id}
              to={`/planner/${product.id}`}
              className="group bg-sidebar rounded-2xl border border-line p-5 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent transition-all duration-500 flex flex-col focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <div className="aspect-[4/3] bg-sidebar rounded-xl mb-6 overflow-hidden relative border border-line/50">
                <img 
                  src={product.image} 
                  alt={t(product.nameKey)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2 text-ink">{t(product.nameKey)}</h2>
              <p className="text-ink opacity-60 text-sm mb-6 flex-1 leading-relaxed line-clamp-2">{t(product.descKey)}</p>
              
              <div className="pt-4 border-t border-line/50 flex items-center justify-between">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
                   {t('open_planner')}
                 </span>
                 <span className="w-8 h-8 rounded-full bg-sidebar flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                   &rarr;
                 </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {unpurchasedProducts.length > 0 && (
         <div className="mt-24 pt-16 border-t border-line border-dashed">
            <div className="flex items-center justify-between mb-10">
               <div>
                 <h3 className="font-serif text-2xl md:text-3xl font-bold italic mb-2">{t('exclusive_access')}</h3>
                 <p className="opacity-60 text-sm">{t('exclusive_access_desc')}</p>
               </div>
               <Link to="/" className="hidden md:inline-flex text-[10px] uppercase font-bold tracking-widest border border-line px-5 py-2.5 rounded hover:bg-sidebar transition-colors">
                  {t('store_link')}
               </Link>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6">
               {unpurchasedProducts.map(p => (
                  <Link key={p.id} to={`/checkout/${p.id}`} className="flex items-center gap-4 p-4 rounded-xl border border-line hover:border-accent/40 bg-sidebar group transition-colors">
                     <img src={p.image} className="w-16 h-16 rounded object-cover" referrerPolicy="no-referrer" />
                     <div className="flex-1">
                        <h4 className="font-serif font-bold text-sm mb-1">{t(p.nameKey)}</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-accent group-hover:underline">Descobrir</p>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}
