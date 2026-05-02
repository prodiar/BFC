import React from 'react';
import { MenuItem } from '../types';
import { Plus, Minus, Info } from 'lucide-react';
import { translations } from '../translations';
import { motion } from 'motion/react';

interface CardProps {
  item: MenuItem;
  lang: 'EN' | 'BN';
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  cartQty: number;
}

export const ProductCard: React.FC<CardProps> = ({ 
  item, lang, addToCart, removeFromCart, cartQty 
}) => {
  const t = translations[lang];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      <div className="h-44 relative overflow-hidden bg-slate-100">
        <img 
          src={item.image} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          alt={item.name} 
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/400/400`;
          }}
        />
        {item.isPopular && (
          <div className="absolute top-3 left-3 bg-amber-400 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Popular
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white font-bold">
          ৳{item.price}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
            {lang === 'EN' ? item.name : item.nameBn}
          </h4>
          <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {cartQty > 0 ? (
            <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg w-full">
              <button 
                onClick={() => removeFromCart(item.id)}
                className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-slate-500 hover:text-primary shadow-sm hover:shadow transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="flex-1 text-center font-bold text-slate-950 text-sm">{cartQty}</span>
              <button 
                onClick={() => addToCart(item)}
                className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-slate-500 hover:text-primary shadow-sm hover:shadow transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(item)}
              disabled={item.stock === 0}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-[0.98] disabled:bg-slate-300"
            >
              <Plus size={16} />
              {t.addToCart}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
