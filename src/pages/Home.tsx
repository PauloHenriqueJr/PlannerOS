import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useAuth, usePurchases, PRODUCTS } from '../store';

export default function Home() {
  const { user } = useAuth();
  const { purchasedIds } = usePurchases();

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isPt = i18n.language === 'pt';

  const formatPrice = (usd: number, brl: number) => {
    return isPt 
      ? `R$ ${brl.toFixed(2).replace('.', ',')}` 
      : `$${usd.toFixed(2)}`;
  };

  const handleBuy = (id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const handlePro = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout/pro');
  }

  return (
    <div className="w-full">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-sidebar to-paper border-b border-line pb-20 md:pb-32 pt-28 md:pt-40 px-4 sm:px-8">
        
        {/* Glow / Ambient Lighting Effects */}
        <div className="absolute top-0 right-0 p-32 opacity-30 mix-blend-screen overflow-hidden pointer-events-none">
          <div className="w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-accent/40 rounded-full blur-[80px]" />
        </div>
        <div className="absolute bottom-0 left-0 p-32 opacity-20 mix-blend-screen overflow-hidden pointer-events-none">
          <div className="w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-sky-500/30 rounded-full blur-[80px]" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Staggered Text Side */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", staggerChildren: 0.2 }}
            className="space-y-8 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/10 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-accent"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t('wow_val_title')}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl italic text-ink tracking-tight leading-[1.05]"
            >
              {t('hero_title_1')}<br className="hidden lg:block"/>{t('hero_title_2')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-2xl text-ink/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              {t('hero_subtitle')}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <a href="#planners" className="w-full sm:w-auto inline-flex items-center justify-center text-xs uppercase tracking-widest font-bold bg-accent text-white px-8 py-4 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(var(--color-accent),0.5)]">
                {t('browse_store')}
              </a>
              <a href="#planners" className="w-full sm:w-auto inline-flex items-center justify-center text-xs uppercase tracking-widest font-bold bg-sidebar/50 text-ink px-8 py-4 rounded-xl border border-line hover:bg-line/50 transition-all backdrop-blur-md">
                 Ver Detalhes
              </a>
            </motion.div>
          </motion.div>

          {/* Floating UI Elements (Glassmorphism Mockup) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="flex relative h-full w-full justify-center items-center mt-12 lg:mt-0"
          >
             <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-[4/3] rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transform perspective-[1500px] sm:rotate-y-[-10deg] sm:rotate-x-[5deg] hover:rotate-0 transition-transform duration-1000 border border-white/10 bg-[#1c1a17]">
                <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-accent/10 rounded-full blur-[60px] z-0 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-accent/5 rounded-full blur-[60px] z-0 pointer-events-none" />
                
                {/* Header Mockup */}
                <div className="h-8 sm:h-10 w-full border-b border-white/5 flex items-center justify-between px-3 sm:px-4 shrink-0 relative z-10 bg-black/20">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-serif italic font-bold text-[8px] sm:text-[10px] text-[#f9f5ed] tracking-wide">PLANN.OS</span>
                    <span className="hidden sm:inline text-[7px] text-[#f9f5ed]/60">Meus Planners</span>
                    <span className="hidden sm:inline text-[7px] text-[#f9f5ed]/60">Loja</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden sm:block w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-6 h-3 sm:w-8 sm:h-4 rounded-full bg-white/10" />
                    <div className="w-10 h-3 sm:w-16 sm:h-4 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="flex flex-1 relative z-10 overflow-hidden">
                  {/* Left Sidebar Mockup */}
                  <div className="hidden sm:flex w-10 border-r border-white/5 flex-col items-center py-6 gap-8 bg-black/10 shrink-0">
                    <span className="text-[6px] tracking-[0.2em] text-[#f9f5ed] font-bold -rotate-90">FOCAR</span>
                    <span className="text-[6px] tracking-[0.2em] text-[#f9f5ed]/40 font-bold -rotate-90 mt-4">DESPEJO</span>
                    <span className="text-[6px] tracking-[0.2em] text-[#f9f5ed]/40 font-bold -rotate-90 mt-6">HÁBITOS</span>
                  </div>

                  {/* Main Content Mockup */}
                  <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-start mb-6 sm:mb-8 shrink-0">
                       <div>
                         <h1 className="font-serif text-lg sm:text-2xl italic text-[#f9f5ed] mb-1">Foco de Hoje</h1>
                         <p className="text-[6px] sm:text-[8px] text-[#f9f5ed]/50">Monday, April 20th • Mindfulness</p>
                       </div>
                       <div className="flex gap-1 sm:gap-2">
                         <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20 flex items-center justify-center opacity-50" />
                         <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20 flex items-center justify-center opacity-50" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 flex-1 overflow-y-auto pr-1">
                      {/* Left Column Form */}
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <div className="text-[6px] font-bold tracking-widest text-[#f9f5ed]/50 mb-2">ADICIONAR RÁPIDO</div>
                          <div className="w-full border-b border-white/20 pb-2 flex justify-between items-center">
                            <span className="text-[8px] sm:text-[10px] text-[#f9f5ed]/40">Qual é o próximo passo?</span>
                            <span className="text-[5px] text-accent font-bold tracking-widest">ADD</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[6px] font-bold tracking-widest text-[#f9f5ed]/50 mb-3">RASTREADORES</div>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/30 flex items-center justify-center text-[6px] sm:text-[8px] text-[#f9f5ed] font-medium">0/4</div>
                            <div className="flex-1">
                              <div className="text-[6px] sm:text-[7px] text-[#f9f5ed]/70 font-bold tracking-widest mb-1">AÇÕES</div>
                              <div className="h-0.5 w-full bg-white/10 rounded-full relative">
                                <div className="absolute top-0 left-0 h-full w-1/4 bg-white/40 rounded-full" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                       {/* Right Column Tasks */}
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <div className="text-[6px] font-bold tracking-widest text-[#f9f5ed]/50 mb-3">LISTA DE TAREFAS</div>
                          <div className="space-y-2 sm:space-y-3">
                            {['Despejo mental de 5 minutos', 'Beber um copo de água', 'Escolha UMA única prioridade', 'Fazer massagem'].map((task, i) => (
                              <div key={i} className="flex items-center gap-2 sm:gap-3 border-b border-white/10 pb-2">
                                <div className="w-3 h-3 rounded border border-white/30 shrink-0" />
                                <span className="text-[8px] sm:text-[9px] text-[#f9f5ed]/80 truncate">{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border border-white/10 rounded-lg p-3 sm:p-4 border-dashed bg-white/[0.03]">
                          <div className="font-serif italic text-[8px] sm:text-[9px] text-[#f9f5ed] mb-1">Inspiração Diária</div>
                          <div className="text-[6px] sm:text-[7px] text-[#f9f5ed]/50 italic">"Celebre o progresso feito hoje."</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="py-20 md:py-32 bg-sidebar border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[1, 2, 3].map((num, i) => (
              <motion.div 
                key={num} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 rounded-full bg-sidebar border border-line flex items-center justify-center font-serif italic text-xl text-accent">0{num}</div>
                <h3 className="font-serif text-2xl font-bold">{t(`wow_val_${num}_t` as any)}</h3>
                <p className="opacity-60 leading-relaxed text-sm md:text-base">{t(`wow_val_${num}_d` as any)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Strategy */}
      <div className="py-24 md:py-32 bg-sidebar border-b border-line relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sidebar/40 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <h2 className="font-serif text-4xl md:text-6xl italic font-bold text-ink">{t('pricing_title')}</h2>
            <p className="opacity-60 text-lg">{t('wow_val_desc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Single App */}
            <div className="bg-sidebar rounded-2xl md:rounded-[2rem] p-8 md:p-12 border border-line flex flex-col hover:shadow-xl hover:border-accent/40 transition-all h-full">
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
            <div className="bg-ink text-paper rounded-2xl md:rounded-[2rem] p-8 md:p-12 flex flex-col shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 border border-paper/10 h-full">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/30 rounded-full blur-[60px] -mr-10 -mt-10 group-hover:bg-accent/40 transition-colors duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-sidebar/5 rounded-full blur-[60px] -ml-10 -mb-10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-paper/50">
                    {formatPrice(9.90, 29.90)} / {isPt ? 'mês' : 'month'}
                  </div>
                  <div className="bg-accent/20 text-accent px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">BEST VALUE</div>
                </div>
                
                <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-paper">{t('price_sub_t')}</h3>
                <p className="opacity-70 mb-8 leading-relaxed">{t('price_sub_d')}</p>
                <ul className="space-y-4 mb-auto pb-8 border-b border-paper/10">
                   <li className="flex items-center text-sm font-medium text-paper text-opacity-90"><span className="text-accent mr-3">✔</span> {t('price_features_sub')}</li>
                </ul>
                <button onClick={handlePro} className="mt-8 text-center text-[10px] w-full uppercase tracking-widest font-bold bg-accent text-paper px-6 py-4 rounded-lg hover:bg-sidebar hover:text-accent transition-all shadow-lg shadow-accent/20">
                   {t('price_sub_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div id="planners" className="py-24 md:py-32 bg-paper w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="mb-16 md:mb-20 text-center md:text-left">
            <h2 className="font-serif text-4xl md:text-5xl italic font-bold mb-4">{t('marketplace')}</h2>
            <p className="opacity-60 text-lg md:text-xl">{t('price_single_t')}</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {PRODUCTS.map(product => {
            const isPurchased = purchasedIds.includes(product.id);

            return (
              <div key={product.id} className="bg-sidebar rounded-2xl border border-line overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:shadow-accent/5 transition-all duration-500 flex flex-col group">
                <div className="aspect-[4/3] bg-sidebar relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 bg-sidebar/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
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
                      {formatPrice(product.priceUsd, product.priceBrl)}
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
    </div>
  );
}
