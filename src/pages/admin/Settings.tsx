import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Configurações da Loja</h1>
        
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" />
              Configurações salvas com sucesso!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Loja</label>
            <input required type="text" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full border p-3 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp (Apenas Números)</label>
            <input required type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border p-3 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-mail de Contato</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-3 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço Físico</label>
            <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border p-3 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Instagram (URL ou @)</label>
            <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full border p-3 focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Horário de Funcionamento</label>
            <input type="text" value={formData.businessHours} onChange={e => setFormData({...formData, businessHours: e.target.value})} className="w-full border p-3 focus:border-indigo-500 outline-none" />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button type="submit" className="bg-slate-900 text-white px-8 py-4 font-bold uppercase hover:bg-slate-800 flex items-center gap-2 tracking-widest">
            <Save className="w-5 h-5"/> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
