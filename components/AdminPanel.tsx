
import React, { useState } from 'react';
import { Order, MenuItem, OrderStatus, UserRole, User, MenuUpdate } from '../types';
import { Button } from './Button';

interface AdminPanelProps {
  cms: any;
  setCms: any;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  orders: Order[];
  setOrders: any;
  onLogout: () => void;
  onMenuUpdate: (update: MenuUpdate) => void;
}

type MainTab = 'DASHBOARD' | 'OPERATIONS' | 'MANIFEST' | 'INTELLIGENCE';
type SubTab = 
  | 'OVERVIEW' | 'REVENUE' | 'TRAFFIC' 
  | 'LIVE_ORDERS' | 'KITCHEN' | 'FLEET' 
  | 'CATALOG' | 'CATEGORIES' | 'STOCK' 
  | 'REGISTRY' | 'TIERS' | 'VOUCHERS';

const SUB_TABS: Record<MainTab, { id: SubTab; label: string; icon: string }[]> = {
  DASHBOARD: [
    { id: 'OVERVIEW', label: 'Overview', icon: 'fa-chart-line' },
    { id: 'REVENUE', label: 'Revenue Intel', icon: 'fa-hand-holding-dollar' },
    { id: 'TRAFFIC', label: 'User Traffic', icon: 'fa-users-rays' },
  ],
  OPERATIONS: [
    { id: 'LIVE_ORDERS', label: 'Live Orders', icon: 'fa-clock-rotate-left' },
    { id: 'KITCHEN', label: 'Kitchen Feed', icon: 'fa-fire-burner' },
    { id: 'FLEET', label: 'Fleet Status', icon: 'fa-truck-fast' },
  ],
  MANIFEST: [
    { id: 'CATALOG', label: 'Unit Catalog', icon: 'fa-book-open' },
    { id: 'CATEGORIES', label: 'Categories', icon: 'fa-tags' },
    { id: 'STOCK', label: 'Inventory', icon: 'fa-boxes-stacked' },
  ],
  INTELLIGENCE: [
    { id: 'REGISTRY', label: 'Personnel Registry', icon: 'fa-address-book' },
    { id: 'TIERS', label: 'Loyalty Tiers', icon: 'fa-crown' },
    { id: 'VOUCHERS', label: 'Voucher Codes', icon: 'fa-ticket' },
  ]
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ menuItems, setMenuItems, orders, onLogout, onMenuUpdate }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('DASHBOARD');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('OVERVIEW');

  const handleMainTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    setActiveSubTab(SUB_TABS[tab][0].id);
  };

  const updatePrice = (id: string, newPrice: number) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;

    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, price: newPrice } : m));
    onMenuUpdate({
      type: 'PRICE_CHANGE',
      itemName: item.name,
      details: `Price adjusted from ৳${item.price} to ৳${newPrice}`,
      timestamp: new Date()
    });
  };

  const toggleStock = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;

    const newStock = item.stock > 0 ? 0 : 50;
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, stock: newStock } : m));
    onMenuUpdate({
      type: 'AVAILABILITY',
      itemName: item.name,
      details: newStock > 0 ? 'Back in operational status (Stock Restored)' : 'Currently out of deployment (Out of Stock)',
      timestamp: new Date()
    });
  };

  return (
    <div className="h-[85vh] glass rounded-[60px] overflow-hidden flex flex-col lg:flex-row border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-elite-up relative">
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none rotate-45 select-none">
        <i className="fas fa-tower-observation text-[400px]"></i>
      </div>
      
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/10 p-10 flex flex-col gap-12 z-10 bg-black/40 backdrop-blur-3xl">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center font-black text-3xl shadow-2xl shadow-red-600/30 ring-1 ring-white/20">C</div>
           <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Command</h1>
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[6px] mt-1">Live Interface</p>
           </div>
        </div>
        
        <nav className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 custom-scrollbar">
          {(['DASHBOARD', 'OPERATIONS', 'MANIFEST', 'INTELLIGENCE'] as MainTab[]).map(t => (
            <button 
              key={t} onClick={() => handleMainTabChange(t)} 
              className={`flex items-center gap-5 px-8 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[3px] transition-all duration-500 whitespace-nowrap ${activeTab === t ? 'bg-red-600 text-white shadow-2xl scale-105 border border-white/20' : 'hover:bg-white/5 text-white/30 hover:text-white'}`}
            >
              <i className={`fas ${t === 'DASHBOARD' ? 'fa-gauge-high' : t === 'OPERATIONS' ? 'fa-microchip' : t === 'MANIFEST' ? 'fa-folder-tree' : 'fa-brain-circuit'} text-lg`}></i>
              {t}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-10 border-t border-white/5">
           <button onClick={onLogout} className="w-full py-5 rounded-[25px] bg-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-[6px] hover:bg-red-600 hover:text-white transition-all border border-red-600/20 shadow-xl active:scale-95">Terminate Access</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 z-10">
        <header className="p-8 lg:px-16 lg:py-10 border-b border-white/5 bg-black/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
              <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter leading-none">{activeTab}</h2>
              <span className="text-[9px] font-black text-red-600 uppercase tracking-[10px]">Sector_0{['DASHBOARD', 'OPERATIONS', 'MANIFEST', 'INTELLIGENCE'].indexOf(activeTab) + 1}</span>
           </div>
           
           <nav className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
              {SUB_TABS[activeTab].map(sub => (
                <button 
                  key={sub.id} 
                  onClick={() => setActiveSubTab(sub.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeSubTab === sub.id ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
                >
                  <i className={`fas ${sub.icon}`}></i>
                  {sub.label}
                </button>
              ))}
           </nav>
        </header>

        <div className="flex-1 p-8 lg:p-16 overflow-y-auto custom-scrollbar space-y-12 bg-gradient-to-b from-transparent to-black/40">
           {activeTab === 'MANIFEST' && activeSubTab === 'CATALOG' && (
             <div className="space-y-8 animate-elite-up">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black italic uppercase tracking-widest">Unit Manifest Registry</h3>
                   <Button size="sm" className="!rounded-xl" onClick={() => {
                     const newItem: MenuItem = { id: Date.now().toString(), name: 'New Elite Item', nameBn: 'নতুন আইটেম', description: 'Fresh deployment', price: 100, category: 'Sides', image: 'https://images.unsplash.com/photo-1541533338070-1880299abc2a?q=80&w=800', stock: 50 };
                     setMenuItems(prev => [...prev, newItem]);
                     onMenuUpdate({ type: 'ADD', itemName: newItem.name, details: 'Strategic addition to the Elite Manifest', timestamp: new Date() });
                   }}>Add New Unit</Button>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                   {menuItems.map(item => (
                     <div key={item.id} className="glass p-8 rounded-[40px] border-white/5 flex gap-8 items-center shadow-2xl group hover:border-white/20 transition-all">
                        <img src={item.image} className="w-24 h-24 rounded-[28px] object-cover shadow-xl" />
                        <div className="flex-1 space-y-2">
                           <h5 className="text-xl font-black italic uppercase">{item.name}</h5>
                           <div className="flex gap-4 items-center">
                              <span className="text-[10px] font-black opacity-30 tracking-[4px]">PRICE: ৳{item.price}</span>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.stock > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-600/10 text-red-600 border border-red-600/20'}`}>
                                {item.stock > 0 ? 'ACTIVE' : 'OFFLINE'}
                              </span>
                           </div>
                           <div className="flex gap-3 pt-2">
                              <button onClick={() => updatePrice(item.id, item.price + 10)} className="bg-white/5 p-2 rounded-xl text-[8px] font-black hover:bg-white/10 transition-all border border-white/10">+ ৳10</button>
                              <button onClick={() => updatePrice(item.id, Math.max(0, item.price - 10))} className="bg-white/5 p-2 rounded-xl text-[8px] font-black hover:bg-white/10 transition-all border border-white/10">- ৳10</button>
                              <button onClick={() => toggleStock(item.id)} className="bg-white/5 p-2 rounded-xl text-[8px] font-black hover:bg-white/10 transition-all border border-white/10">Toggle Stock</button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'OPERATIONS' && activeSubTab === 'LIVE_ORDERS' && (
             <div className="space-y-8 animate-elite-up">
                <h3 className="text-2xl font-black italic uppercase tracking-widest">Active Fleet Deployment</h3>
                <div className="grid gap-6">
                   {orders.map(o => (
                     <div key={o.id} className="glass p-8 rounded-[40px] flex justify-between items-center border-white/5 hover:bg-white/10 transition-all shadow-2xl">
                        <div className="flex gap-8 items-center">
                           <div className="w-16 h-16 bg-red-600/10 text-red-600 rounded-[24px] flex items-center justify-center text-2xl border border-red-600/10"><i className="fas fa-box-open"></i></div>
                           <div>
                              <p className="text-[10px] font-black opacity-30 tracking-[4px]">{o.id}</p>
                              <h5 className="text-xl font-black italic uppercase tracking-tighter">{o.customerName}</h5>
                           </div>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-[3px] border border-emerald-500/20">{o.status}</span>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {(activeTab !== 'MANIFEST' || activeSubTab !== 'CATALOG') && (activeTab !== 'OPERATIONS' || activeSubTab !== 'LIVE_ORDERS') && (
             <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6 opacity-20 animate-scale-in">
                <i className={`fas ${SUB_TABS[activeTab].find(s => s.id === activeSubTab)?.icon} text-9xl`}></i>
                <h4 className="text-4xl font-black italic uppercase tracking-tighter">Initializing Intel Stream...</h4>
                <div className="w-64 h-[2px] bg-white/10 relative overflow-hidden">
                   <div className="absolute inset-y-0 left-0 bg-red-600 w-1/3 animate-loading"></div>
                </div>
             </div>
           )}
        </div>
      </main>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading { animation: loading 1.5s infinite ease-in-out; }
      `}</style>
    </div>
  );
};
