import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, usePurchases, PRODUCTS } from '../store';
import { useState } from 'react';

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buyPlanner } = usePurchases();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = productId === 'pro';
  const product = PRODUCTS.find(p => p.id === productId);
  
  const isPt = i18n.language === 'pt';

  const formatPrice = (usd: number, brl: number) => {
    return isPt 
      ? `R$ ${brl.toFixed(2).replace('.', ',')}` 
      : `$${usd.toFixed(2)}`;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isPro && !product) {
    navigate('/');
    return null;
  }

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: isPro ? 'pro' : product?.id,
          priceUsd: usdPrice,
          priceBrl: brlPrice,
          title,
          isPt,
          email: user?.email,
          userId: user?.uid, // Used as client_reference_id
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        setError(data.error || 'Failed to initialize payment gateway.');
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  // Pricing Logic
  const usdPrice = isPro ? 9.90 : (product?.priceUsd || 0);
  const brlPrice = isPro ? 29.90 : (product?.priceBrl || 0);
  const title = isPro ? t('price_sub_t') : t(product?.nameKey || '');
  const subtitle = isPro ? t('price_features_sub') : t('price_features_single');

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif italic text-3xl md:text-5xl text-ink mb-12">{t('checkout_title')}</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Form */}
          <div className="flex-1 bg-sidebar p-8 rounded-2xl border border-line shadow-sm h-fit">
            <h3 className="font-serif font-bold text-xl mb-6">{t('payment_method')}</h3>
            
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-sidebar rounded-full flex items-center justify-center mb-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                 </svg>
              </div>
              <h4 className="font-bold text-ink">
                {t('secure_payment')}
              </h4>
              <p className="text-sm opacity-60 max-w-sm">
                {t('secure_payment_desc')}
              </p>
            </div>

            {error && (
              <div className="mt-4 p-4 text-xs font-bold text-red-600 bg-red-50 rounded">
                {t('error')} {error}
              </div>
            )}

            <button 
              onClick={handlePay}
              disabled={loading}
              className="mt-8 w-full bg-accent text-white font-bold tracking-widest uppercase text-xs py-4 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? t('processing') : t('pay_now')}
            </button>

            <p className="mt-6 text-[10px] leading-relaxed text-center opacity-40 bg-accent/5 p-3 rounded">
               {t('final_step_desc')}
            </p>

          </div>

          {/* Summary Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-sidebar p-6 rounded-2xl border border-line shadow-sm">
                <h3 className="font-serif font-bold text-xl mb-6 pb-4 border-b border-line">{t('order_summary')}</h3>
                
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="font-medium text-sm text-ink mb-1">{title}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-accent opacity-80">{subtitle}</p>
                  </div>
                  <span className="font-serif italic font-bold">
                    {formatPrice(usdPrice, brlPrice)}
                  </span>
                </div>

                <div className="pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-bold opacity-70">{t('total')}</span>
                  <span className="font-serif text-2xl italic font-bold text-accent">
                    {formatPrice(usdPrice, brlPrice)} 
                    {isPro && <span className="text-sm ml-1">/ {isPt ? 'mês' : 'mo'}</span>}
                  </span>
                </div>
            </div>
            
            <div className="bg-sidebar/50 backdrop-blur-sm p-4 rounded-xl border border-line flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-50">{t('ssl_secured')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
