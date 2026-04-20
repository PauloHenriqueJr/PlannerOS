import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, usePurchases, PRODUCTS, PlannerProduct } from '../store';
import CheckoutModal from '../components/CheckoutModal';

export default function Home() {
  const { user } = useAuth();
  const { purchasedIds, buyPlanner } = usePurchases();
  const navigate = useNavigate();
  const [checkoutProduct, setCheckoutProduct] = useState<PlannerProduct | null>(null);

  const handleBuy = (product: PlannerProduct) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setCheckoutProduct(product);
  };

  const handleSuccess = () => {
    if (!checkoutProduct) return;
    buyPlanner(checkoutProduct.id);
    setCheckoutProduct(null);
    navigate('/dashboard');
  };

  return (
    <>
      {checkoutProduct && (
        <CheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-8">

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent">Digital Planner Platform</p>
            <h1 className="font-serif text-5xl md:text-7xl italic text-ink tracking-tight leading-tight">
              Stop losing your PDFs.<br/>Start actually planning.
            </h1>
            <p className="text-lg text-ink opacity-60">
              Interactive digital planners you use right here — no downloads, no copying. Access them forever from any device.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <a href="#planners" className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-6 py-3 rounded hover:opacity-90 transition-opacity">Browse Planners</a>
              {!user && <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-ink opacity-60 hover:opacity-100 transition-opacity">Sign In</Link>}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mb-16 flex-wrap">
            {['🔒 Secure access', '♾️ Lifetime license', '📱 Any device', '⚡ Instant unlock'].map(b => (
              <span key={b} className="text-xs opacity-50 font-medium">{b}</span>
            ))}
          </div>

          {/* Products grid */}
          <div id="planners" className="grid md:grid-cols-3 gap-8">
            {PRODUCTS.map(product => {
              const isPurchased = purchasedIds.includes(product.id);
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-line overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:shadow-accent/5 transition-all duration-500 flex flex-col group">
                  <div className="aspect-[4/3] bg-sidebar relative overflow-hidden">
                    <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                      {product.tag}
                    </div>
                    {isPurchased && (
                      <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        Owned
                      </div>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <h3 className="font-serif text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="opacity-60 mb-6 flex-1 text-sm leading-relaxed">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-serif italic text-accent">${product.price.toFixed(2)}</span>
                      {isPurchased ? (
                        <Link
                          to={`/planner/${product.id}`}
                          className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-5 py-2 rounded hover:opacity-90 transition-opacity"
                        >
                          Open →
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleBuy(product)}
                          className="text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-5 py-2 rounded hover:opacity-90 transition-opacity"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="mt-24 text-center">
            <h2 className="font-serif text-3xl italic mb-12 text-ink">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { step: '01', title: 'Choose your planner', desc: 'Pick the template that fits your lifestyle or business.' },
                { step: '02', title: 'Pay once', desc: 'Secure payment via Stripe or Pix. Lifetime access, no subscriptions.' },
                { step: '03', title: 'Start planning', desc: 'Open your planner here in the app. Works on any device, anytime.' },
              ].map(item => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="text-4xl font-serif italic text-accent/30">{item.step}</div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-sm opacity-50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
