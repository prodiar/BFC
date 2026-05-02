import React from 'react';
import { ViewState, User, CartItem } from '../types';
import { ShoppingBag, Settings, Menu, UserCircle } from 'lucide-react';
import { translations } from '../translations';

interface HeaderProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  user: User | null;
  cart: CartItem[];
  lang: 'EN' | 'BN';
  setIsSettingsOpen: (v: boolean) => void;
}

export const AppHeader: React.FC<HeaderProps> = ({ 
  view, setView, user, cart, lang, setIsSettingsOpen 
}) => {
  const t = translations[lang];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-white shadow-sm border-b border-slate-100 flex justify-between items-center px-4 md:px-10 no-print">
      <div 
        className="flex items-center gap-2.5 cursor-pointer" 
        onClick={() => setView('HOME')}
      >
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
          B
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-none">BFC ELITE</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Bangla Food Club</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <button 
          onClick={() => setView('HOME')} 
          className={`text-xs font-bold transition-colors ${view === 'HOME' ? 'text-primary' : 'text-slate-500 hover:text-slate-900'}`}
        >
          {t.home}
        </button>
        <button 
          onClick={() => setView('MENU')} 
          className={`text-xs font-bold transition-colors ${view === 'MENU' ? 'text-primary' : 'text-slate-500 hover:text-slate-900'}`}
        >
          {t.catalogue}
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={() => setView('CART')} 
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-white text-[8px] rounded-full flex items-center justify-center font-bold border border-white">
              {cart.reduce((a, b) => a + b.qty, 0)}
            </span>
          )}
        </button>

        {user ? (
          <button 
            onClick={() => setView('PROFILE')} 
            className="flex items-center gap-2 p-0.5 pl-2.5 rounded-full border border-slate-200 hover:border-primary transition-all bg-slate-50"
          >
            <span className="text-[10px] font-bold text-slate-700 hidden sm:block">{user.name.split(' ')[0]}</span>
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {user.name.charAt(0)}
            </div>
          </button>
        ) : (
          <button 
            onClick={() => setView('LOGIN')} 
            className="text-[10px] font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors uppercase tracking-widest"
          >
            {t.signIn}
          </button>
        )}

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>
    </nav>
  );
};
