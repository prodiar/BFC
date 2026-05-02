
import { MenuItem, LayoutPreset, ThemeConfig } from './types';

export const DEFAULT_THEMES: Record<LayoutPreset, ThemeConfig> = {
  BFC_CLASSIC: { 
    bg: '#ffffff', 
    fg: '#1a1a1a', 
    primary: '#8b1e3f', 
    accent: '#008b45', 
    card: '#ffffff', 
    border: '#f0f0f0', 
    font: 'Hind Siliguri', 
    shadow: 'rgba(139, 30, 63, 0.1)' 
  },
  ELITE_DARK: { bg: '#030712', fg: '#f9fafb', primary: '#dc2626', accent: '#ef4444', card: '#111827', border: '#1f2937', font: 'Plus Jakarta Sans', shadow: 'rgba(0,0,0,0.5)' },
  MINIMAL_WHITE: { bg: '#ffffff', fg: '#0f172a', primary: '#111827', accent: '#64748b', card: '#f8fafc', border: '#f1f5f9', font: 'Plus Jakarta Sans', shadow: 'rgba(0,0,0,0.05)' }
};

export const MOCK_MENU: MenuItem[] = [
  // --- SNACKS ---
  { id: 'sn_1', name: 'Thai Fry (2P)', nameBn: 'থাই ফ্রাই (২ পিস)', description: 'Crispy and spicy Thai style fried chicken.', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1562967914-6cbb241c2ad3?q=80&w=400', stock: 50 },
  { id: 'sn_2', name: 'Special CK Fry (2P)', nameBn: 'স্পেশাল সিকে ফ্রাই (২ পিস)', description: 'BFC special crispy fried chicken.', price: 100, category: 'Snacks', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=400', stock: 40, isPopular: true },
  { id: 'sn_3', name: 'CK Crispy Drumstick (1P)', nameBn: 'সিকে ক্রিস্পি ড্রামস্টিক', description: 'Juicy chicken drumstick with a crunchy layer.', price: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?q=80&w=400', stock: 50 },
  { id: 'sn_4', name: 'Hot Wings (6P)', nameBn: 'হট উইংস (৬ পিস)', description: 'Classic spicy chicken wings.', price: 150, category: 'Snacks', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=400', stock: 35 },
  { id: 'sn_5', name: 'Chicken Shawarma', nameBn: 'চিকেন শর্মা', description: 'Authentic chicken shawarma wrap.', price: 70, category: 'Snacks', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?q=80&w=400', stock: 65, isPopular: true },
  { id: 'sn_6', name: 'Hot Chicken Chaap & Luchi', nameBn: 'হট চিকেন চাপ ও লুচি', description: 'Traditional chicken chaap served with fluffy luchi.', price: 100, category: 'Featured', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400', stock: 30, isPopular: true },
  
  // --- BURGERS ---
  { id: 'br_1', name: 'CK Burger', nameBn: 'সিকে বার্গার', description: 'Classic BFC chicken burger.', price: 60, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400', stock: 50 },
  { id: 'br_2', name: 'Club Special Burger', nameBn: 'ক্লাব স্পেশাল বার্গার', description: 'The grand special burger of BFC.', price: 120, category: 'Burgers', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=400', stock: 25, isPopular: true },

  // --- PIZZA ---
  { id: 'pz_1', name: 'Chicken Pizza (6")', nameBn: 'চিকেন পিৎজা (৬")', description: '6 inch personal chicken pizza.', price: 180, category: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400', stock: 15 },
  
  // --- FUCHKA ---
  { id: 'fk_1', name: 'Doi Fuchka', nameBn: 'দই ফুচকা', description: 'Creamy yogurt topped fuchka.', price: 60, category: 'Fuchka', image: 'https://images.unsplash.com/photo-1606491956391-70868b5d0f47?q=80&w=400', stock: 50 },
  
  // --- SET MENU ---
  { id: 'sm_1', name: 'Set Menu 1', nameBn: 'সেট মেনু ১', description: 'Fried Rice + Vegetable + Fried Chicken.', price: 120, category: 'Set Menu', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=400', stock: 40 }
];
