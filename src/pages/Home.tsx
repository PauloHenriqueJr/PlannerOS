import { Link, useNavigate } from 'react-router-dom';
import { useAuth, usePurchases, PRODUCTS } from '../store';

export default function Home() {
  const { user } = useAuth();
  const { purchasedIds, buyPlanner } = usePurchases();
  const navigate = useNavigate();

  const handleBuy = (id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    buyPlanner(id);
    navigate('/dashboard');
  };

  return (
    <div className="w-full py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h1 className="font-serif text-5xl md:text-7xl italic text-ink tracking-tight">
            Stop losing your PDFs.<br/>Start actually planning.
          </h1>
          <p className="text-lg md:text-xl text-ink opacity-60">
            Native, interactive digital planners that sync across your devices. No more copying, no more losing files. Use them directly in our app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {PRODUCTS.map(product => {
            const isPurchased = purchasedIds.includes(product.id);

            return (
              <div key={product.id} className="bg-white rounded-2xl border border-line overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:shadow-accent/5 transition-all duration-500 flex flex-col group">
                <div className="aspect-[4/3] bg-sidebar relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
                    {product.tag}
                  </div>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-serif text-2xl font-bold mb-2">{product.name}</h3>
                  <p className="opacity-60 mb-8 flex-1 text-sm leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-serif italic text-accent">
                      ${product.price.toFixed(2)}
                    </span>
                    {isPurchased ? (
                      <Link 
                        to="/dashboard"
                        className="text-[10px] font-bold uppercase tracking-widest bg-sidebar border border-line text-ink px-5 py-2 rounded hover:bg-line transition-colors"
                      >
                        Owned
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleBuy(product.id)}
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
      </div>
    </div>
  );
}
