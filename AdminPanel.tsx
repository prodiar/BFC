
import React, { useState, useEffect } from 'react';
import { Order, MenuItem, OrderStatus, User, MenuUpdate, Analytics, AuditLog } from './types';
import { Button } from './components/Button';
import { API } from './services/api';

interface AdminPanelProps {
  user: User;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  orders: Order[];
  onLogout: () => void;
  onMenuUpdate: (update: MenuUpdate) => void;
  cms: any;
  setCms: any;
  setOrders: any;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, menuItems, setMenuItems, orders, onLogout }) => {
  const [tab, setTab] = useState<'INTEL' | 'FLEET' | 'MANIFEST' | 'AUDIT'>('INTEL');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setAnalytics(await API.getAnalytics());
      setLogs(await API.getAuditLogs());
    };
    fetch();
  }, [orders, tab]);

  const updateStatus = async (id: string, s: OrderStatus) => {
    await API.updateOrderStatus(id, s, user.name);
  };

  const toggleStock = async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (item) {
      const updated = { ...item, stock: item.stock > 0 ? 0 : 50 };
      await API.updateMenuItem(updated, user.name);
      setMenuItems(prev => prev.map(m => m.id === id ? updated : m));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-red-500/30">
      <nav className="h-24 bg-black/60 backdrop-blur-3xl border-b border-white/5 px-10 flex justify-between items-center sticky top-0 z-[100]">
        <div className="flex items-center gap-8">
          <div className="w-14 h-14 bg-red-600 rounded-[20px] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-red-600/30 ring-1 ring-white/10">C</div>
          <div>
            <h2 className="font-black italic uppercase tracking-tighter text-2xl leading-none">Command Center</h2>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[6px] mt-2 animate-pulse">Live Strategic Link: {user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-10">
           <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-[4px] text-white/30 border-r border-white/5 pr-10">
              <div className="text-right"><p>Uptime</p><p className="text-white mt-1">99.9% Optimal</p></div>
              <div className="text-right"><p>Fleet</p><p className="text-white mt-1">{orders.length} Active</p></div>
           </div>
           <button onClick={onLogout} className="text-[10px] font-black uppercase tracking-[6px] text-red-600 bg-red-600/10 px-10 py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-600/20 shadow-xl active:scale-95">De-authorize Session</button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-96px)] overflow-hidden">
        <aside className="w-full md:w-80 bg-black/40 border-r border-white/5 p-10 flex md:flex-col gap-5 overflow-y-auto custom-scrollbar">
           {[
             { id: 'INTEL', icon: 'fa-gauge-high', label: 'Intelligence' },
             { id: 'FLEET', icon: 'fa-receipt', label: 'Fleet Ops' },
             { id: 'MANIFEST', icon: 'fa-folder-tree', label: 'Unit Manifest' },
             { id: 'AUDIT', icon: 'fa-shield-halved', label: 'Audit Logs' }
           ].map(i => (
             <button 
               key={i.id} onClick={() => setTab(i.id as any)}
               className={`flex items-center gap-6 px-8 py-6 rounded-[32px] text-[10px] font-black uppercase tracking-[4px] transition-all duration-500 border-2 ${tab === i.id ? 'bg-red-600 text-white shadow-2xl scale-105 border-white/10' : 'bg-white/5 text-white/20 border-white/0 hover:bg-white/10 hover:text-white hover:border-white/5'}`}
             >
               <i className={`fas ${i.icon} text-xl`}></i>
               {i.label}
             </button>
           ))}
        </aside>

        <main className="flex-1 p-10 lg:p-16 overflow-y-auto bg-gradient-to-br from-[#050505] to-[#0a0a0a] custom-scrollbar">
           {tab === 'INTEL' && analytics && (
             <div className="space-y-16 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="bg-white/5 border border-white/5 p-16 rounded-[64px] backdrop-blur-3xl shadow-2xl group hover:border-red-600/20 transition-all">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[6px] mb-8">Revenue Velocity</p>
                      <p className="text-7xl font-black text-red-600 tracking-tighter">৳{analytics.totalSales.toLocaleString()}</p>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-16 rounded-[64px] backdrop-blur-3xl shadow-2xl group hover:border-white/20 transition-all">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[6px] mb-8">Deployments Logged</p>
                      <p className="text-7xl font-black text-white tracking-tighter">{analytics.totalOrders}</p>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-16 rounded-[64px] backdrop-blur-3xl shadow-2xl group hover:border-emerald-600/20 transition-all">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[6px] mb-8">Avg Intel Score</p>
                      <p className="text-7xl font-black text-emerald-500 tracking-tighter">৳{analytics.averageOrderValue.toFixed(0)}</p>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-20 rounded-[80px] backdrop-blur-3xl shadow-2xl">
                   <div className="flex justify-between items-center mb-16">
                      <h4 className="text-2xl font-black italic uppercase tracking-[12px] text-white/60">Sales Trajectory (7D)</h4>
                      <div className="flex gap-4">
                         <div className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                         <span className="text-[10px] font-black uppercase tracking-widest">Live Flow</span>
                      </div>
                   </div>
                   <div className="flex items-end gap-12 h-96">
                      {analytics.salesByDay.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-8 group">
                           <div className="w-full bg-red-600/5 rounded-t-[32px] border-t-2 border-red-600/20 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-1000 relative" style={{ height: `${(d.amount / (Math.max(...analytics.salesByDay.map(x => x.amount)) || 1)) * 100}%` }}>
                              <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur px-4 py-2 rounded-xl whitespace-nowrap border border-red-600/20 shadow-2xl">৳{d.amount}</span>
                           </div>
                           <p className="text-[10px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap rotate-45 mt-6">{d.date.split('-').slice(1).join('/')}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

           {tab === 'FLEET' && (
             <div className="space-y-16 animate-fade-in">
                <div className="flex justify-between items-center">
                   <h3 className="text-5xl font-black italic uppercase tracking-tighter">Fleet Deployments</h3>
                   <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-10 py-4 rounded-3xl border border-emerald-500/20 uppercase tracking-[5px]">Comms Secure</div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[64px] overflow-hidden shadow-2xl">
                   <table className="w-full text-left">
                      <thead className="bg-white/5 text-white/20 text-[11px] font-black uppercase tracking-[8px]">
                         <tr>
                            <th className="px-16 py-10">Target Identity</th>
                            <th className="px-16 py-10">Intel Value</th>
                            <th className="px-16 py-10">Vector Ref</th>
                            <th className="px-16 py-10">Fleet Status</th>
                            <th className="px-16 py-10">Control</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm font-bold">
                         {orders.map(o => (
                           <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                              <td className="px-16 py-10">
                                 <p className="text-white text-xl italic uppercase tracking-tight group-hover:text-red-600 transition-colors">{o.customerName}</p>
                                 <p className="text-[9px] text-white/20 uppercase tracking-widest mt-2">Asset #{o.id}</p>
                              </td>
                              <td className="px-16 py-10">
                                 <p className="text-red-600 font-black text-2xl tracking-tighter">৳{o.total}</p>
                                 <p className="text-[9px] text-white/20 uppercase tracking-widest mt-2">{o.paymentMethod}</p>
                              </td>
                              <td className="px-16 py-10">
                                 <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${o.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-600/10 text-red-600 border-red-600/10'}`}>{o.paymentStatus}</span>
                              </td>
                              <td className="px-16 py-10">
                                 <span className="bg-white/5 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">{o.status.replace('_', ' ')}</span>
                              </td>
                              <td className="px-16 py-10">
                                 <select 
                                   className="bg-black/60 border-2 border-white/10 rounded-[24px] px-8 py-4 text-[11px] font-black uppercase tracking-[4px] outline-none focus:border-red-600 transition-all cursor-pointer shadow-xl"
                                   value={o.status}
                                   onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                                 >
                                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                 </select>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {tab === 'MANIFEST' && (
             <div className="space-y-16 animate-fade-in">
                <div className="flex justify-between items-center">
                   <h3 className="text-5xl font-black italic uppercase tracking-tighter">Unit Manifest</h3>
                   <Button size="lg" className="rounded-[32px] !bg-white !text-black shadow-none border-none">Deploy New Unit</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                   {menuItems.map(item => (
                     <div key={item.id} className="bg-white/5 p-12 rounded-[72px] border border-white/5 flex gap-10 items-center backdrop-blur-3xl group hover:border-white/20 transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 blur-3xl rounded-full"></div>
                        <div className="w-32 h-32 rounded-[40px] overflow-hidden shadow-2xl relative ring-4 ring-white/5">
                           <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                           {item.stock === 0 && <div className="absolute inset-0 bg-red-950/60 backdrop-blur-sm flex items-center justify-center"><i className="fas fa-eye-slash text-red-600 text-3xl"></i></div>}
                        </div>
                        <div className="flex-1 space-y-6">
                           <div>
                              <h5 className="font-black italic uppercase text-2xl leading-none mb-2">{item.nameBn}</h5>
                              <p className="text-[9px] font-black text-white/20 uppercase tracking-[6px]">{item.name}</p>
                           </div>
                           <div className="flex items-center gap-10">
                              <div className="space-y-1">
                                 <p className="text-red-600 font-black text-3xl tracking-tighter">৳{item.price}</p>
                                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Manifest Value</p>
                              </div>
                              <button 
                                onClick={() => toggleStock(item.id)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${item.stock > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10 hover:bg-red-600/10 hover:text-red-600 hover:border-red-600/20' : 'bg-red-600/10 text-red-600 border-red-600/10 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20'}`}
                              >
                                 <i className={`fas ${item.stock > 0 ? 'fa-check' : 'fa-power-off'} text-xl`}></i>
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {tab === 'AUDIT' && (
             <div className="space-y-16 animate-fade-in">
                <h3 className="text-5xl font-black italic uppercase tracking-tighter">Strategic Audit Logs</h3>
                <div className="space-y-6">
                   {logs.map(l => (
                     <div key={l.id} className="bg-white/5 p-10 rounded-[48px] border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-10">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl border-2 ${l.action.includes('PAYMENT') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-600/10 text-red-600 border-red-600/10'}`}>
                              <i className={`fas ${l.action.includes('PAYMENT') ? 'fa-shield-check' : 'fa-bolt-auto'}`}></i>
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase text-white/20 tracking-[6px] mb-2">{l.action}</p>
                              <h5 className="font-black text-lg text-white/80">{l.details}</h5>
                              <p className="text-[10px] font-bold text-white/10 mt-2">OPERATOR: {l.user} • {new Date(l.timestamp).toLocaleString()}</p>
                           </div>
                        </div>
                        <i className="fas fa-fingerprint text-3xl text-white/5 group-hover:text-red-600/20 transition-all"></i>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.4); }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};
