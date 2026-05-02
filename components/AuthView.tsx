import React, { useState } from 'react';
import { translations } from '../translations';
import { User, ViewState } from '../types';
import { API } from '../services/api';
import { Mail, Phone, User as UserIcon, Lock, ChevronRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  lang: 'EN' | 'BN';
  setCurrentUser: (u: User | null) => void;
}

export const AuthView: React.FC<AuthProps> = ({ view, setView, lang, setCurrentUser }) => {
  const t = translations[lang];
  const isSignIn = view === 'LOGIN';
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignIn) {
        if (!formData.phone || !formData.password) {
          setError(lang === 'EN' ? 'Please provide phone and password.' : 'ফোন এবং পাসওয়ার্ড দিন।');
          setLoading(false);
          return;
        }
        const user = await API.login(formData.phone, formData.password);
        if (user) {
          setCurrentUser(user);
          setView('HOME');
        } else {
          setError(lang === 'EN' ? 'Access Denied. Check credentials.' : 'এক্সেস ডিনাইড। তথ্য যাচাই করুন।');
        }
      } else {
        if (!formData.name || !formData.phone || !formData.password) {
          setError(lang === 'EN' ? 'All vital fields required.' : 'সবগুলো ফিল্ড পূরণ করুন।');
          setLoading(false);
          return;
        }
        const user = await API.signup(formData);
        setCurrentUser(user);
        setView('HOME');
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        setError(lang === 'EN' 
          ? 'Authentication strategy not enabled. Please enable "Email/Password" in your Firebase Console under Authentication > Sign-in method.' 
          : 'লগইন সিস্টেম চালু করা নেই। ফায়ারবেস কনসোলের Authentication > Sign-in method-এ গিয়ে Email/Password চালু করুন।');
      } else if (err?.code === 'auth/email-already-in-use') {
        setError(lang === 'EN' ? 'This phone/email is already registered.' : 'এই নাম্বারটি ইতিমধ্যে নিবন্ধিত।');
      } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/user-not-found') {
        setError(lang === 'EN' ? 'Invalid phone or password.' : 'ভুল নাম্বার বা পাসওয়ার্ড।');
      } else {
        setError(err?.message || 'Protocol Error. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        <motion.div 
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="px-8 pt-12 pb-8 text-center bg-slate-50 border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>
            
            <div className="relative z-10 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-xl shadow-primary/20 rotate-3">
              B
            </div>
            <h2 className="relative z-10 text-3xl font-black text-slate-900 tracking-tight italic">
              {isSignIn ? t.auth.title : (lang === 'EN' ? 'JOIN ELITE.' : 'এলিট মেম্বারশিপ')}
            </h2>
            <p className="relative z-10 text-primary font-black text-[10px] mt-2 uppercase tracking-[4px]">
              {isSignIn ? t.auth.subtitle : (lang === 'EN' ? 'Exclusive Access Protocol' : 'এক্সক্লুসিভ এক্সেস প্রোটোকল')}
            </p>
          </div>

          <div className="p-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-50 text-red-600 text-[11px] font-black border-l-4 border-red-500 rounded-r-xl uppercase tracking-wider"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSignIn && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'EN' ? 'Identity' : 'নাম'}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><UserIcon size={18} /></div>
                    <input 
                      required
                      type="text" 
                      placeholder={lang === 'EN' ? "Full Name" : "আপনার নাম"}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-bold outline-none text-sm placeholder:text-slate-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'EN' ? 'Comms' : 'যোগাযোগ'}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Phone size={18} /></div>
                  <input 
                    required
                    type="tel" 
                    placeholder={t.auth.placeholder}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-bold outline-none text-sm placeholder:text-slate-300"
                  />
                </div>
              </div>

              {!isSignIn && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'EN' ? 'Base Email' : 'ইমেইল'}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Mail size={18} /></div>
                    <input 
                      type="email" 
                      placeholder={lang === 'EN' ? "Email Address" : "ইমেইল ঠিকানা"}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-bold outline-none text-sm placeholder:text-slate-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{lang === 'EN' ? 'Encrypted Key' : 'পাসওয়ার্ড'}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><Lock size={18} /></div>
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    placeholder={lang === 'EN' ? "Password" : "পাসওয়ার্ড"}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-bold outline-none text-sm placeholder:text-slate-300"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isSignIn ? t.auth.accessSignal : (lang === 'EN' ? 'Authorize Membership' : 'মেম্বারশিপ নিশ্চিত করুন')}
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              {isSignIn ? (
                <div className="space-y-4">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">
                    {lang === 'EN' ? "Unauthorized?" : "অ্যাকাউন্ট নেই?"}{' '}
                    <button 
                       onClick={() => setView('SIGNUP')}
                       className="text-primary hover:underline ml-1"
                    >
                      {lang === 'EN' ? "Establish Identity" : "নতুন একাউন্ট"}
                    </button>
                  </p>
                  <div className="flex items-center gap-2 justify-center text-[9px] font-black text-slate-300 uppercase italic">
                    <ShieldCheck size={12} className="text-primary" />
                    Secure Elite Protocol Active
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[3px]">
                  <button 
                     onClick={() => setView('LOGIN')}
                     className="text-slate-400 flex items-center justify-center gap-2 mx-auto hover:text-primary transition-colors"
                  >
                    <ArrowLeft size={14} />
                    {lang === 'EN' ? "Back to HQ Login" : "লগইন এ ফিরে যান"}
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
