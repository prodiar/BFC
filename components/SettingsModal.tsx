import React from 'react';
import { translations } from '../translations';
import { X, Globe, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ViewState } from '../types';
import { API } from '../services/api';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'EN' | 'BN';
  setLang: (l: 'EN' | 'BN') => void;
  user: User | null;
  onLogout: () => void;
  setView: (v: ViewState) => void;
}

export const SettingsModal: React.FC<SettingsProps> = ({ 
  isOpen, onClose, lang, setLang, user, onLogout, setView 
}) => {
  const t = translations[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex justify-end no-print"
          onClick={onClose}
        >
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 flex justify-between items-center border-b">
              <h2 className="text-2xl font-black italic uppercase tracking-tight">{t.settings}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[4px]">
                  <Globe size={14} />
                  {t.language}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setLang('EN')}
                    className={`py-6 rounded-2xl font-black border-2 transition-all ${lang === 'EN' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    ENGLISH
                  </button>
                  <button 
                    onClick={() => setLang('BN')}
                    className={`py-6 rounded-2xl font-bold border-2 transition-all font-bangla ${lang === 'BN' ? 'border-primary bg-primary-light text-primary shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    বাংলা
                  </button>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[4px]">
                  <Shield size={14} />
                  Account Protocol
                </div>
                {user ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl uppercase">
                         {user.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                         <p className="text-xs font-semibold text-slate-400">{user.phone}</p>
                       </div>
                    </div>
                    {user.role === 'ADMIN' && (
                      <button 
                        onClick={() => { setView('ADMIN'); onClose(); }}
                        className="w-full h-16 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                      >
                        <Shield size={18} />
                        Command Center (Admin)
                      </button>
                    )}
                    <button 
                      onClick={onLogout}
                      className="w-full h-16 rounded-2xl bg-white border-2 border-slate-100 text-red-500 font-bold flex items-center justify-center gap-3 hover:bg-red-50 hover:border-red-100 transition-all uppercase tracking-widest text-xs"
                    >
                      <LogOut size={18} />
                      {t.signOut}
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-6 text-center">
                    <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">Join BFC Elite for faster payments and priority catering access.</p>
                    <button 
                      onClick={onLogout}
                      className="w-full bg-slate-900 text-white h-16 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg"
                    >
                      Member Portal Access
                    </button>
                  </div>
                )}
              </section>
            </div>

            <div className="p-8 border-t bg-slate-50 bg-opacity-30">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[6px]">BFC Elite v7.0.0</p>
                <div className="flex items-center gap-4 text-slate-200">
                  <Shield size={12} />
                  <Globe size={12} />
                  <LogOut size={12} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
