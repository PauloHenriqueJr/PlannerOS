import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, usePurchases, PRODUCTS } from '../store';

export default function Home() {
  const { user } = useAuth();
  const { purchasedIds, buyPlanner } = usePurchases();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBuy = (id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    buyPlanner(id);
    navigate('/dashboard');
  };

  const handlePro = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    PRODUCTS.forEach(p => buyPlanner(p.id));
    navigate('/dashboard');
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="py-20 md:py-32 px-4 sm:px-8 border-b border-line bg-gradient-to-b from-canvas to-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/40 to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-[10px] font-bold uppercase tracking-widest text-accent mb-4">
            {t('wow_val_title')}
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl italic text-ink tracking-tight leading-[1.1]">
            {t('hero_title_1')}<br className="hidden sm:block"/>{t('hero_title_2')}
          </h1>
          <p className="text-lg md:text-2xl text-ink opacity-60 px-4 max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="pt-8">
            <a href="#planners" className="inline-flex items-center text-xs uppercase tracking-widest font-bold bg-accent text-white px-8 py-4 rounded-lg hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-accent/20">
              {t('browse_store')}
            </a>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-20 md:py-32 bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[1, 2, 3].map((num) => (
              <div key={num} className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-sidebar border border-line flex items-center justify-center font-serif italic text-xl text-accent">0{num}</div>
                <h3 className="font-serif text-2xl font-bold">{t(`wow_val_${num}_t` as any)}</h3>
                <p className="opacity-60 leading-relaxed text-sm md:text-base">{t(`wow_val_${num}_d` as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Strategy */}
      <div className="py-24 md:py-32 bg-sidebar border-b border-line relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/40 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <h2 className="font-serif text-4xl md:text-6xl italic font-bold text-ink">{t('pricing_title')}</h2>
            <p className="opacity-60 text-lg">{t('wow_val_desc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Single App */}
            <div className="bg-white rounded-2xl md:rounded-[2rem] p-8 md:p-12 border border-line flex flex-col hover:shadow-xl hover:border-accent/40 transition-all">
              <div className="text-[10px] uppercase font-bold tracking-widest text-accent mb-4">{t('price_single_p')}</div>
              <h3 className="font-serif text-3xl font-bold mb-4">{t('price_single_t')}</h3>
              <p className="opacity-60 mb-8 leading-relaxed">{t('price_single_d')}</p>
              <ul className="space-y-4 mb-auto pb-8 border-b border-line">
                 <li className="flex items-center text-sm font-medium"><span className="text-accent mr-3">✔</span> {t('price_features_single')}</li>
              </ul>
              <a href="#planners" className="mt-8 text-center text-[10px] uppercase tracking-widest font-bold border border-line px-6 py-4 rounded-lg hover:bg-sidebar transition-colors">
                 {t('browse_store')}
              </a>
            </div>

            {/* Subscription */}
            <div className="bg-ink text-white rounded-2xl md:rounded-[2rem] p-8 md:p-12 flex flex-col shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border border-white/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/30 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-accent/40 transition-colors duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-white/50">{t('price_sub_p')}</div>
                  <div className="bg-accent/20 text-accent px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">BEST VALUE</div>
                </div>
                
                <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white">{t('price_sub_t')}</h3>
                <p className="opacity-70 mb-8 leading-relaxed">{t('price_sub_d')}</p>
                <ul className="space-y-4 mb-auto pb-8 border-b border-white/10">
                   <li className="flex items-center text-sm font-medium text-white text-opacity-90"><span className="text-accent mr-3">✔</span> {t('price_features_sub')}</li>
                </ul>
                <button onClick={handlePro} className="mt-8 text-center text-[10px] w-full uppercase tracking-widest font-bold bg-accent text-white px-6 py-4 rounded-lg hover:bg-white hover:text-accent transition-all shadow-lg shadow-accent/20">
                   {t('price_sub_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div id="planners" className="py-24 md:py-32 bg-white max-w-7xl mx-auto px-4 sm:px-8">
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <h2 className="font-serif text-4xl md:text-5xl italic font-bold mb-4">{t('marketplace')}</h2>
          <p className="opacity-60 text-lg md:text-xl">{t('price_single_t')}</p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {PRODUCTS.map(product => {
            const isPurchased = purchasedIds.includes(product.id);

            return (
              <div key={product.id} className="bg-white rounded-2xl border border-line overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:shadow-accent/5 transition-all duration-500 flex flex-col group">
                <div className="aspect-[4/3] bg-sidebar relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    {t(product.tagKey)}
                  </div>
                  <img 
                    src={product.image} 
                    alt={t(product.nameKey)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">{t(product.nameKey)}</h3>
                  <p className="opacity-60 mb-6 sm:mb-8 flex-1 text-xs sm:text-sm leading-relaxed">{t(product.descKey)}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-line/50">
                    <span className="text-lg sm:text-xl font-serif italic text-accent">
                      ${product.price.toFixed(2)}
                    </span>
                    {isPurchased ? (
                      <Link 
                        to="/dashboard"
                        className="text-[10px] font-bold uppercase tracking-widest bg-sidebar border border-line text-ink px-5 py-2.5 rounded hover:bg-line transition-colors"
                      >
                        {t('owned')}
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleBuy(product.id)}
                        className="text-[10px] font-bold uppercase tracking-widest bg-ink text-white px-5 py-2.5 rounded hover:opacity-90 transition-opacity"
                      >
                        {t('buy_now')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
