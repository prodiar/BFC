import React, { useState } from 'react';
import { ViewState, CartItem, Order, MenuItem, User, PaymentMethod, OrderStatus } from '../types';
import { translations } from '../translations';
import { Trash2, ShoppingBag, MapPin, Phone, User as UserIcon, CreditCard, Wallet, Banknote, ShieldCheck, ChevronRight, ArrowLeft, Lock, Smartphone, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { cn } from '../services/utils';
import { API } from '../services/api';

interface OrderFlowProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  lang: 'EN' | 'BN';
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  addToCart: (i: MenuItem) => void;
  removeFromCart: (id: string) => void;
  user: User | null;
  setLastOrder: (o: Order) => void;
}

type PaymentStep = 'METHOD_SELECT' | 'MFS_NUM' | 'MFS_PIN' | 'CARD_DETAILS' | 'PROCESSING';

export const OrderFlow: React.FC<OrderFlowProps> = ({ 
  view, setView, lang, cart, setCart, addToCart, removeFromCart, user, setLastOrder 
}) => {
  const t = translations[lang];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BKASH');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('METHOD_SELECT');
  const [walletNumber, setWalletNumber] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  
  const [checkoutData, setCheckoutData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((acc, c) => acc + (c.item.price * c.qty), 0);
  const delivery = 50;
  const total = subtotal + delivery;

  const initiatePayment = () => {
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      alert(lang === 'EN' ? "Please provide all details." : "সব তথ্য প্রদান করুন।");
      return;
    }
    
    if (paymentMethod === 'COD') {
        setView('GATEWAY');
        handleFinalizeOrder();
    } else if (['BKASH', 'NAGAD', 'ROCKET', 'UPAY'].includes(paymentMethod)) {
        setPaymentStep('MFS_NUM');
        setView('GATEWAY');
    } else {
        setPaymentStep('CARD_DETAILS');
        setView('GATEWAY');
    }
  };

  const handleFinalizeOrder = async () => {
    setLoading(true);
    setPaymentStep('PROCESSING');
    
    try {
      // Simulate payment gateway/order processing delay
      await new Promise(r => setTimeout(r, 2000));

      const order: Order = {
        id: `BFC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        customerId: user?.id || 'GUEST',
        customerName: checkoutData.name,
        customerPhone: checkoutData.phone,
        address: checkoutData.address,
        items: [...cart],
        subtotal,
        deliveryCharge: delivery,
        total,
        status: paymentMethod === 'COD' ? OrderStatus.PENDING : OrderStatus.PAID,
        paymentMethod,
        transactionId: paymentMethod === 'COD' ? '' : `TXN_${Date.now()}`,
        createdAt: new Date().toISOString(),
        paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PAID',
        trackingHistory: [{ status: paymentMethod === 'COD' ? OrderStatus.PENDING : OrderStatus.PAID, time: new Date().toISOString() }]
      };

      await API.placeOrder(order);
      setLastOrder(order);
      setCart([]);
      setLoading(false);
      setView('RECEIPT');
    } catch (error) {
      console.error("Order processing error:", error);
      setLoading(false);
      setPaymentStep('METHOD_SELECT');
      setView('CHECKOUT');
      alert(lang === 'EN' ? "Order failed. Please try again or check your connection." : "অর্ডার সফল হয়নি। আবার চেষ্টা করুন বা ইন্টারনেট সংযোগ পরীক্ষা করুন।");
    }
  };

  if (view === 'CART') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
          <ShoppingBag className="text-primary" size={24} />
          {t.cart}
        </h2>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200 py-16 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.yourCartIsEmpty}</p>
            <Button onClick={() => setView('MENU')} className="mt-6 px-8 rounded-xl text-xs">
              {t.browseMenu}
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {cart.map(c => (
                <div key={c.item.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <img src={c.item.image} className="w-14 h-14 rounded-lg object-cover" alt="" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{lang === 'EN' ? c.item.name : c.item.nameBn}</h4>
                      <p className="text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-wider">৳{c.item.price} / unit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                      <button onClick={() => removeFromCart(c.item.id)} className="w-7 h-7 rounded bg-white flex items-center justify-center text-slate-400 hover:text-primary shadow-sm transition-all font-bold text-xs">-</button>
                      <span className="font-bold text-slate-900 w-3 text-center text-sm">{c.qty}</span>
                      <button onClick={() => addToCart(c.item)} className="w-7 h-7 rounded bg-white flex items-center justify-center text-slate-400 hover:text-primary shadow-sm transition-all font-bold text-xs">+</button>
                    </div>
                    <p className="font-black text-base text-slate-900 w-20 text-right">৳{c.item.price * c.qty}</p>
                    <button onClick={() => removeFromCart(c.item.id)} className="text-slate-200 hover:text-red-500 transition-colors ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/10 h-fit space-y-6 sticky top-20">
              <h3 className="font-bold text-slate-900 text-base tracking-tight uppercase border-b border-slate-50 pb-3">{t.subtotal}</h3>
              <div className="space-y-3 text-[13px] font-semibold text-slate-500">
                <div className="flex justify-between"><span>{cart.reduce((a, b) => a + b.qty, 0)} units</span><span>৳{subtotal}</span></div>
                <div className="flex justify-between"><span>{t.deliveryCharge}</span><span>৳{delivery}</span></div>
                <div className="pt-4 border-t border-slate-100 flex justify-between text-xl font-black text-slate-900">
                  <span>{t.total}</span><span className="text-primary font-bangla">৳{total}</span>
                </div>
              </div>
              <Button fullWidth onClick={() => setView('CHECKOUT')} size="lg" className="rounded-xl py-3.5 shadow-lg shadow-primary/20 text-sm">
                {t.checkout}
                <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'CHECKOUT') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8 flex items-center gap-3">
          <button onClick={() => setView('CART')} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.finalizeAuthorization}</h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-lg border border-slate-50">
               <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center"><MapPin size={18} /></div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">{lang === 'EN' ? 'Shipping Details' : 'ডেলিভারি ঠিকানা'}</h3>
               </div>
               <div className="space-y-3">
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="text" placeholder={t.fullClientName}
                      value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})}
                      className="w-full pl-10 pr-6 py-3.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-sm"
                    />
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      type="tel" placeholder={t.phoneComms}
                      value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})}
                      className="w-full pl-10 pr-6 py-3.5 rounded-xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all text-sm"
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-5 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <textarea 
                      placeholder={t.logisticsAddress} rows={2}
                      value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})}
                      className="w-full pl-10 pr-6 py-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all resize-none text-sm"
                    ></textarea>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-lg border border-slate-50">
               <div className="flex items-center gap-2.5 mb-6 border-b border-slate-50 pb-4">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center"><Wallet size={18} /></div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">{t.paymentVector}</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BKASH', label: 'bKash', icon: <CreditCard size={18} />, color: 'text-pink-600', bg: 'bg-pink-50' },
                    { id: 'NAGAD', label: 'Nagad', icon: <Wallet size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { id: 'ROCKET', label: 'Rocket', icon: <Smartphone size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { id: 'UPAY', label: 'Upay', icon: <Smartphone size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'VISA', label: 'Visa/Master', icon: <CreditCard size={18} />, color: 'text-indigo-600', bg: 'bg-slate-50' },
                    { id: 'COD', label: 'Cash', icon: <Banknote size={18} />, color: 'text-slate-600', bg: 'bg-slate-100' }
                  ].map(pm => (
                    <button 
                      key={pm.id} 
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all group h-24 justify-center",
                        paymentMethod === pm.id ? "border-primary bg-primary-light" : "border-slate-50 hover:bg-slate-50 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm", pm.bg, pm.color)}>
                        {pm.icon}
                      </div>
                      <span className="text-center font-bold text-slate-900 text-[9px] uppercase tracking-wider">{pm.label}</span>
                    </button>
                  ))}
               </div>

               <div className="mt-6 pt-6 border-t border-slate-50 space-y-3">
                 <div className="flex justify-between items-center text-slate-500 font-bold text-xs">
                    <span>Payable Amount</span>
                    <span className="text-xl text-slate-950 font-black">৳{total}</span>
                 </div>
                 <Button 
                   fullWidth 
                   size="lg" 
                   loading={loading}
                   className="py-3.5 text-sm rounded-xl" 
                   onClick={initiatePayment}
                 >
                   {t.finalizeAuthorization}
                 </Button>
               </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[1.5rem] flex gap-3">
               <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
               <p className="text-emerald-800 text-[10px] font-semibold leading-tight">
                 {t.safeEncrypted}. SSL Secure Layer Active.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'GATEWAY') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden"
         >
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center"><Lock size={20} /></div>
                   <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-tighter leading-none">Secure Node Bridge</h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest px-1">TXN REF: {Date.now().toString(36).toUpperCase()}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SSL SECURE</div>
                </div>
            </div>

            <div className="p-8 md:p-16">
               <AnimatePresence mode="wait">
                  {paymentStep === 'MFS_NUM' && (
                    <motion.div 
                       key="num"
                       initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                       className="space-y-8 max-w-sm mx-auto"
                    >
                       <div className="text-center">
                          <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Wallet Authorization</h3>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Confirm your {paymentMethod} identification</p>
                       </div>
                       
                       <div className="relative group">
                          <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary" size={24} />
                          <input 
                             type="tel" 
                             placeholder="Example: 017XXXXXXXX"
                             value={walletNumber} 
                             onChange={e => setWalletNumber(e.target.value)}
                             className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-2xl border-none outline-none font-black text-2xl tracking-widest focus:ring-4 focus:ring-primary/10 transition-all text-slate-900" 
                          />
                       </div>

                       <Button fullWidth size="lg" className="py-6 rounded-2xl" onClick={() => setPaymentStep('MFS_PIN')}>
                          Next Protocol
                       </Button>
                    </motion.div>
                  )}

                  {paymentStep === 'MFS_PIN' && (
                    <motion.div 
                       key="pin"
                       initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                       className="space-y-8 max-w-sm mx-auto"
                    >
                       <div className="text-center">
                          <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Entry PIN</h3>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Vault protection enabled for {walletNumber}</p>
                       </div>
                       
                       <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary" size={24} />
                          <input 
                             type="password" 
                             placeholder="••••"
                             maxLength={4}
                             value={walletPin} 
                             onChange={e => setWalletPin(e.target.value)}
                             className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-2xl border-none outline-none font-black text-4xl tracking-[1.5rem] focus:ring-4 focus:ring-primary/10 transition-all text-slate-900" 
                          />
                       </div>

                       <Button fullWidth size="lg" className="py-6 rounded-2xl" onClick={handleFinalizeOrder}>
                          Finalize Transaction
                       </Button>
                       <button onClick={() => setPaymentStep('MFS_NUM')} className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Change Number</button>
                    </motion.div>
                  )}

                  {paymentStep === 'CARD_DETAILS' && (
                    <motion.div 
                       key="card"
                       initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                       className="space-y-6 max-w-md mx-auto"
                    >
                       <div className="text-center">
                          <h3 className="text-2xl font-black text-slate-900 mb-2 italic uppercase">Card Authentication</h3>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Military-grade AES encryption active</p>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="relative group">
                             <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary" size={20} />
                             <input 
                                type="text" placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)"
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all"
                             />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <input 
                                type="text" placeholder="MM/YY"
                                className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all"
                             />
                             <input 
                                type="text" placeholder="CVV"
                                className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all"
                             />
                          </div>
                          <input 
                             type="text" placeholder="Cardholder Name"
                             className="w-full px-6 py-4 bg-slate-50 rounded-xl border-none outline-none font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all"
                          />
                       </div>

                       <Button fullWidth size="lg" className="py-6 rounded-2xl" onClick={handleFinalizeOrder}>
                          Finalize Authorization
                       </Button>
                    </motion.div>
                  )}

                  {paymentStep === 'PROCESSING' && (
                    <motion.div 
                       key="proc"
                       initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                       className="text-center space-y-12 py-12"
                    >
                        <div className="relative w-32 h-32 mx-auto">
                           <motion.div 
                              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="absolute inset-0 border-4 border-primary/10 border-t-primary rounded-full"
                           />
                           <div className="absolute inset-0 flex items-center justify-center text-primary">
                              <ShieldCheck size={48} />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-3xl font-black text-slate-900 italic uppercase italic tracking-tighter">Syncing With Node</h3>
                           <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto leading-relaxed uppercase tracking-widest">Connecting to {paymentMethod} verification center. Please do not close this window.</p>
                        </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
            
            <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-left">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[4px] mb-1">Authorization Value</p>
                   <p className="text-2xl font-black text-white italic">৳{total}</p>
                </div>
                <div className="flex gap-6 grayscale opacity-30">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Nagad_Logo.svg" className="h-6" alt="" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/BKash_Logo.svg" className="h-6" alt="" />
                   <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="" />
                </div>
            </div>
         </motion.div>
      </div>
    );
  }

  return null;
};
