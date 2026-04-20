import React, { useState } from 'react';
import { PlannerProduct } from '../store';

interface Props {
  product: PlannerProduct;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'form' | 'processing' | 'success';
type PayMethod = 'card' | 'pix';

export default function CheckoutModal({ product, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const simulate = () => {
    setStep('processing');
    // In production: call your backend /api/checkout → Stripe PaymentIntent → confirm
    setTimeout(() => {
      setStep('success');
      setTimeout(onSuccess, 1800);
    }, 2200);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (cardNum.replace(/\s/g, '').length < 16) { setError('Card number invalid.'); return; }
    if (expiry.length < 5) { setError('Expiry invalid.'); return; }
    if (cvv.length < 3) { setError('CVV invalid.'); return; }
    simulate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-accent px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Secure Checkout</p>
              <h2 className="font-serif text-xl font-bold">{product.name}</h2>
            </div>
            <button onClick={onClose} className="text-2xl leading-none opacity-70 hover:opacity-100 transition-opacity mt-0.5">&times;</button>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-serif italic">${product.price.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-60">one-time · lifetime access</span>
          </div>
        </div>

        <div className="p-8">
          {step === 'form' && (
            <>
              {/* Payment method toggle */}
              <div className="flex rounded-lg border border-line overflow-hidden mb-6">
                {(['card', 'pix'] as PayMethod[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${payMethod === m ? 'bg-accent text-white' : 'text-ink opacity-50 hover:opacity-80'}`}
                  >
                    {m === 'card' ? 'Credit Card' : 'Pix'}
                  </button>
                ))}
              </div>

              {payMethod === 'pix' ? (
                <div className="text-center space-y-5 py-4">
                  <div className="w-44 h-44 bg-sidebar border-2 border-dashed border-line rounded-xl mx-auto flex items-center justify-center text-xs opacity-40 font-mono leading-relaxed">
                    [QR Code]<br/>via Pix API
                  </div>
                  <p className="text-sm opacity-60 leading-relaxed">Scan the QR code with your banking app.<br />Access releases instantly after payment.</p>
                  <button
                    onClick={simulate}
                    className="w-full text-[10px] font-bold uppercase tracking-widest bg-accent text-white py-3.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    I already paid
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCardSubmit} className="space-y-5">
                  <Field label="Cardholder Name">
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Maria Silva" className={input} />
                  </Field>
                  <Field label="Card Number">
                    <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} required placeholder="4242 4242 4242 4242" className={`${input} font-mono tracking-widest`} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry">
                      <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} required placeholder="MM/YY" className={`${input} font-mono`} />
                    </Field>
                    <Field label="CVV">
                      <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} required placeholder="123" className={`${input} font-mono`} />
                    </Field>
                  </div>
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <button type="submit" className="w-full text-[10px] font-bold uppercase tracking-widest bg-accent text-white py-3.5 rounded-lg hover:opacity-90 transition-opacity mt-2">
                    Pay ${product.price.toFixed(2)} Securely
                  </button>
                  <p className="text-center text-[10px] opacity-40 uppercase tracking-wider">🔒 SSL Encrypted · Powered by Stripe</p>
                </form>
              )}
            </>
          )}

          {step === 'processing' && (
            <div className="py-14 flex flex-col items-center space-y-5">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm opacity-60">Processing your payment…</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-14 flex flex-col items-center space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-3xl">✓</div>
              <div>
                <h3 className="font-serif text-2xl italic text-ink mb-1">Payment Confirmed!</h3>
                <p className="text-sm opacity-60">Your planner is unlocked.<br />Redirecting to dashboard…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const input = 'w-full px-4 py-3 rounded-lg bg-sidebar border border-line focus:outline-none focus:border-accent transition-colors text-sm';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2">{label}</label>
      {children}
    </div>
  );
}
