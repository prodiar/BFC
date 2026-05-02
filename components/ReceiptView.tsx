import React, { useRef, useState } from 'react';
import { Order } from '../types';
import { translations } from '../translations';
import { motion } from 'motion/react';
import { Printer, CheckCircle2, Home, Download, Loader2, UtensilsCrossed, QrCode, ShieldCheck, Calendar, MapPin, Phone, CreditCard, Wallet, Banknote } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

interface ReceiptProps {
  order: Order;
  lang: 'EN' | 'BN';
  onHome: () => void;
}

export const ReceiptView: React.FC<ReceiptProps> = ({ order, lang, onHome }) => {
  const t = translations[lang];
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, { 
        cacheBust: true, 
        pixelRatio: 4, // Ultra high res for graphics
        backgroundColor: '#f8fafc',
        filter: (node) => {
          const exclusionClasses = ['no-print'];
          return !exclusionClasses.some(cls => 
            node instanceof HTMLElement && node.classList.contains(cls)
          );
        }
      });

      const imgProps = new Image();
      imgProps.src = dataUrl;
      
      await new Promise((resolve) => {
        imgProps.onload = resolve;
      });

      const pdfWidth = 210;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`BFC-Elite-Receipt-${order.id}.pdf`);

      // Also trigger a PNG download for "image" request
      const link = document.createElement('a');
      link.download = `BFC-Elite-Receipt-${order.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Generation failed', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const getPaymentIcon = () => {
    switch (order.paymentMethod) {
      case 'COD': return <Banknote size={14} />;
      case 'VISA': return <CreditCard size={14} />;
      default: return <Wallet size={14} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 md:px-0 font-sans">
      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 no-print">
        <button 
            onClick={downloadPDF}
            disabled={downloading}
            className="flex-1 bg-primary text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {lang === 'EN' ? 'Download Elite Assets' : 'এলিট রিসিট ও ইমেজ ডাউনলোড'}
        </button>
        <button 
            onClick={onHome}
            className="flex-1 bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <Home size={18} />
          {t.returnToBase}
        </button>
      </div>

      <div 
        ref={receiptRef} 
        className="bg-white rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col relative"
        style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
      >
        {/* Background Graphic Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
        </div>
        
        {/* Top Header Branding */}
        <div className="relative bg-slate-900 px-8 py-8 flex justify-between items-center overflow-hidden">
          {/* Accent stripes */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-[30deg] translate-x-20"></div>
          
          <div className="relative z-10 flex items-center gap-2.5">
             <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg transform -rotate-3">
                <UtensilsCrossed size={20} />
             </div>
             <div>
               <h1 className="text-lg font-black text-white italic tracking-tighter leading-none">BFC ELITE.</h1>
               <p className="text-[7px] font-black text-primary uppercase tracking-[2px] mt-1">Bangla Food Club / HQ Node</p>
             </div>
          </div>

          <div className="relative z-10 text-right">
             <div className="inline-block px-2.5 py-0.5 bg-white/10 backdrop-blur-md rounded text-[7px] font-black text-primary uppercase tracking-[2px] mb-1">
               Elite Manifest
             </div>
             <p className="text-xl font-black text-white italic tracking-tighter leading-none">#{order.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 p-8 md:p-10 space-y-8">
           {/* Info Grid */}
           <div className="grid grid-cols-2 gap-8 text-[10px]">
              <div className="space-y-3.5">
                 <div>
                    <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Recipient Node</h3>
                    <p className="text-[13px] font-black text-slate-900 leading-none">{order.customerName}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-0.5">{order.customerPhone}</p>
                 </div>
                 <div>
                    <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Sector Address</h3>
                    <p className="text-[10px] font-bold text-slate-700 leading-tight pr-4">{order.address}</p>
                 </div>
              </div>

              <div className="space-y-3.5 text-right">
                 <div>
                    <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Temporal Stamp</h3>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-slate-900">
                       <Calendar size={10} className="text-primary" />
                       {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                 </div>
                 <div>
                    <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Payment Method</h3>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-black text-primary italic uppercase">
                       {getPaymentIcon()}
                       {order.paymentMethod}
                    </div>
                 </div>
              </div>
           </div>

           {/* Security Seal Overlay (Subtle) */}
           <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none rotate-12">
              <ShieldCheck size={180} />
           </div>

           {/* Items Table */}
           <div className="space-y-2">
              <div className="grid grid-cols-12 px-4 py-1.5 bg-slate-50 rounded-md text-[7px] font-black text-slate-500 uppercase tracking-[1.5px]">
                 <div className="col-span-1">ID</div>
                 <div className="col-span-7">Description</div>
                 <div className="col-span-1 text-center">QTY</div>
                 <div className="col-span-3 text-right">Credit</div>
              </div>
              <div className="space-y-0.5">
                 {order.items.map((item, i) => (
                   <div key={i} className="grid grid-cols-12 px-4 py-2.5 border-b border-slate-50 items-center">
                      <div className="col-span-1 text-[8px] font-black text-slate-300">0{i+1}</div>
                      <div className="col-span-7">
                         <p className="text-[10px] font-bold text-slate-900 truncate">{lang === 'EN' ? item.item.name : item.item.nameBn}</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Unit: ৳{item.item.price}</p>
                      </div>
                      <div className="col-span-1 text-center font-black text-slate-950 text-[10px]">
                         ×{item.qty}
                      </div>
                      <div className="col-span-3 text-right text-[11px] font-black text-slate-900 italic">
                         ৳{item.item.price * item.qty}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Calculation & Integrity */}
           <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-2">
              <div className="flex items-center gap-2.5">
                 <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <QrCode size={32} className="text-slate-400" />
                 </div>
                 <div>
                    <h4 className="text-[8px] font-black text-slate-900 uppercase italic leading-none">Integrity Auth</h4>
                    <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest max-w-[120px] mt-1 leading-tight">Verified manifest scan for elite nodes.</p>
                 </div>
              </div>

              <div className="w-full md:w-56 space-y-1.5">
                 <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Base Val</span>
                    <span className="text-slate-900 font-black">৳{order.subtotal}</span>
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Cargo Fee</span>
                    <span className="text-slate-900 font-black">৳{order.deliveryCharge}</span>
                 </div>
                 <div className="pt-2.5 border-t border-slate-900 flex justify-between items-end">
                    <div>
                       <p className="text-[8px] font-black text-primary uppercase italic leading-none">Total Settlement</p>
                       <p className="text-xl font-black text-slate-900 tracking-tighter italic mt-0.5">NET TOTAL</p>
                    </div>
                    <div className="text-3xl font-black text-primary italic tracking-tighter leading-none">
                       ৳{order.total}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex justify-between items-center">
           <p className="text-[7px] font-black text-slate-300 uppercase tracking-[3px]">BFC Elite Protocol / Deployment Ver: 9.0.0</p>
           <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-primary rounded-full"></div>
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
};
