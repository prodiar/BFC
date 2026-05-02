import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, User, Order, CartItem, ViewState } from './types';
import { API } from './services/api';
import { translations } from './translations';
import { AppHeader } from './components/AppHeader';
import { ProductCard } from './components/ProductCard';
import { AuthView } from './components/AuthView';
import { OrderFlow } from './components/OrderFlow';
import { ReceiptView } from './components/ReceiptView';
import { SettingsModal } from './components/SettingsModal';
import { AdminPanel } from './AdminPanel';
import { UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, Utensils, Star, Clock, MapPin, ShoppingBag, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(API.getCurrentUser());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'BN'>('EN');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    let unsubSync: (() => void) | null = null;

    const sync = async (user: User | null) => {
      setMenuItems(await API.getMenu());
      setOrders(await API.getOrders(user));
      
      // Setup listener with user context
      if (unsubSync) unsubSync();
      unsubSync = API.subscribe(user, () => sync(user));
    };

    const unsubAuth = API.onAuthStateChanged((user) => {
      setCurrentUser(user);
      sync(user);
    });

    return () => {
      unsubAuth();
      if (unsubSync) unsubSync();
    };
  }, []);

  const t = translations[lang];
  const categories = useMemo(() => ['All', ...new Set(menuItems.map(item => item.category))], [menuItems]);
  const filteredMenu = useMemo(() => activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory), [menuItems, activeCategory]);

  const addToCart = (item: MenuItem) => {
    if (item.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.item.id === item.id);
      if (ex) return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const ex = prev.find(i => i.item.id === id);
      if (ex && ex.qty > 1) return prev.map(i => i.item.id === id ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i.item.id !== id);
    });
  };

  const logout = () => {
    API.logout();
    setCurrentUser(null);
    setIsSettingsOpen(false);
    setView('HOME');
  };

  if (view === 'ADMIN' && currentUser?.role === UserRole.ADMIN) {
    return <AdminPanel 
      user={currentUser} 
      menuItems={menuItems} 
      setMenuItems={setMenuItems} 
      orders={orders} 
      onLogout={logout}
      onMenuUpdate={() => {}} 
      cms={null} setCms={null} setOrders={() => {}} 
    />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <AppHeader 
        view={view} setView={setView} user={currentUser} 
        cart={cart} lang={lang} setIsSettingsOpen={setIsSettingsOpen} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        lang={lang} setLang={setLang} user={currentUser} onLogout={logout} 
        setView={setView}
      />

      <main className="flex-1 pt-20 pb-24">
        <AnimatePresence mode="wait">
          {view === 'HOME' && (
            <motion.div 
               key="home"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="space-y-16"
            >
              <section className="relative h-[70vh] min-h-[450px] flex items-center overflow-hidden bg-slate-900 mx-4 md:mx-10 rounded-[2.5rem] mt-4 shadow-xl">
                <div className="absolute inset-0 z-0">
                  <img src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2000" className="w-full h-full object-cover opacity-40 mix-blend-overlay" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 space-y-10">
                   <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 text-primary-light text-[10px] font-black uppercase tracking-[4px]">
                     <Star size={12} fill="currentColor" />
                     Dhaka's #1 Fried Chicken Base
                   </div>
                   <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter max-w-2xl">
                     {t.dhakaBest} <br/><span className="text-primary italic">{t.friedChicken}.</span>
                   </h2>
                   <p className="text-slate-300 max-w-sm text-base md:text-lg font-medium leading-relaxed">
                     {t.experienceStandard} Prepared with secret spices and delivered to your base across the capital.
                   </p>
                   <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                         onClick={() => setView('MENU')}
                         className="group bg-primary text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-3"
                      >
                         {t.orderNow}
                         <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button 
                         onClick={() => setView('MENU')}
                         className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-xl text-base font-bold hover:bg-white/20 transition-all"
                      >
                         {t.browseMenu}
                      </button>
                   </div>
                </div>
              </section>

              <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
                 {[
                   { icon: <Clock className="text-primary" />, title: 'Elite Delivery', desc: 'Average manifest arrival time: 28 minutes within corporate sectors.' },
                   { icon: <Utensils className="text-primary" />, title: 'Premium Units', desc: 'Grade-A units sourced from verified poultry bases daily.' },
                   { icon: <MapPin className="text-primary" />, title: 'Node Expansion', desc: 'Operating across 14 major strategic sectors in Dhaka City.' }
                 ].map((feat, i) => (
                   <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                     <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
                       {feat.icon}
                     </div>
                     <h4 className="text-lg font-bold text-slate-900 mb-3">{feat.title}</h4>
                     <p className="text-slate-500 font-medium leading-relaxed text-[13px]">{feat.desc}</p>
                   </div>
                 ))}
              </section>
            </motion.div>
          )}

          {view === 'MENU' && (
            <motion.div 
               key="menu"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
               className="max-w-7xl mx-auto px-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                 <div className="space-y-1">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{t.catalogue}</h3>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[6px]">Active Tactical Menu</p>
                 </div>
                 <div className="flex gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-4 pr-4">
                    {categories.map(c => (
                      <button 
                        key={c} onClick={() => setActiveCategory(c)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === c ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100 hover:border-primary/50 hover:text-primary'}`}
                      >
                        {lang === 'EN' ? c : c}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
                 {filteredMenu.map(item => (
                   <ProductCard 
                      key={item.id} item={item} lang={lang} 
                      addToCart={addToCart} removeFromCart={removeFromCart} 
                      cartQty={cart.find(c => c.item.id === item.id)?.qty || 0} 
                   />
                 ))}
              </div>
            </motion.div>
          )}

          {(view === 'LOGIN' || view === 'SIGNUP') && (
            <AuthView view={view} setView={setView} lang={lang} setCurrentUser={setCurrentUser} />
          )}

          {['CART', 'CHECKOUT', 'GATEWAY'].includes(view) && (
            <OrderFlow 
              view={view} setView={setView} lang={lang} 
              cart={cart} setCart={setCart} 
              addToCart={addToCart} removeFromCart={removeFromCart} 
              user={currentUser} setLastOrder={setLastOrder} 
            />
          )}

          {view === 'RECEIPT' && lastOrder && (
            <ReceiptView order={lastOrder} lang={lang} onHome={() => setView('HOME')} />
          )}

        </AnimatePresence>
      </main>

      {/* Mobile Dock - Hidden on large screens */}
      <nav className="md:hidden fixed bottom-6 inset-x-6 h-20 bg-slate-900 border border-white/10 rounded-[2.5rem] flex justify-around items-center px-10 z-[100] no-print shadow-2xl backdrop-blur-xl">
        <button onClick={() => setView('HOME')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'HOME' ? 'text-primary scale-110' : 'text-slate-400'}`}>
           <Utensils size={24} />
           <span className="text-[8px] font-bold uppercase tracking-widest">{t.mobileDock.base}</span>
        </button>
        <button onClick={() => setView('MENU')} className={`flex flex-col items-center gap-1.5 transition-all ${view === 'MENU' ? 'text-primary scale-110' : 'text-slate-400'}`}>
           <Star size={24} />
           <span className="text-[8px] font-bold uppercase tracking-widest">{t.mobileDock.menu}</span>
        </button>
        <button onClick={() => setView('CART')} className={`flex flex-col items-center gap-1.5 relative transition-all ${['CART', 'CHECKOUT'].includes(view) ? 'text-primary scale-110' : 'text-slate-400'}`}>
           <ShoppingBag size={24} />
           {cart.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[9px] rounded-full flex items-center justify-center font-bold border-2 border-slate-900">{cart.reduce((a, b) => a + b.qty, 0)}</span>}
           <span className="text-[8px] font-bold uppercase tracking-widest">{t.mobileDock.manifest}</span>
        </button>
        <button onClick={() => currentUser ? setView('PROFILE') : setView('LOGIN')} className={`flex flex-col items-center gap-1.5 transition-all ${['PROFILE', 'LOGIN', 'SIGNUP'].includes(view) ? 'text-primary scale-110' : 'text-slate-400'}`}>
           <UserCircle size={24} />
           <span className="text-[8px] font-bold uppercase tracking-widest">{t.mobileDock.elite}</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
