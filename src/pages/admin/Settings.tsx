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
      
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-sm border border-slate-200 space-y-8">
        <div>
          <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-4 border-b pb-2">Informações Gerais da Loja</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nome da Loja</label>
              <input required type="text" value={formData.storeName || ''} onChange={e => setFormData({...formData, storeName: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">WhatsApp (Apenas Números com DDD)</label>
              <input required type="text" value={formData.whatsapp || ''} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">E-mail de Contato</label>
              <input required type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Endereço Físico para Cabeçalho/Rodapé</label>
              <input required type="text" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Instagram (ex: @usuario ou Link)</label>
              <input type="text" value={formData.instagram || ''} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Horário de Funcionamento</label>
              <input type="text" value={formData.businessHours || ''} onChange={e => setFormData({...formData, businessHours: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider mb-4 border-b pb-2">Layout e Banner Principal (Hero)</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Link da Imagem de Fundo (URL Externa)</label>
              <input 
                type="url" 
                placeholder="https://exemplo.com/imagem-fundo-calcados.jpg"
                value={formData.heroBgUrl || ''} 
                onChange={e => setFormData({...formData, heroBgUrl: e.target.value})} 
                className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm font-mono" 
              />
              <p className="text-[10px] text-slate-400 mt-1">Insira um link para mudar a foto de fundo que serve de destaque na tela inicial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Título do Banner</label>
                <textarea 
                  rows={2}
                  placeholder="Passo Forte no&#10;Atacado de Calçados."
                  value={formData.heroTitle || ''} 
                  onChange={e => setFormData({...formData, heroTitle: e.target.value})} 
                  className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm resize-none" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Use quebra de linha normal para alinhar o título nos calçados.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Subtítulo / Descrição Curta</label>
                <textarea 
                  rows={2}
                  placeholder="Sua melhor vitrine de revenda profissional..."
                  value={formData.heroSubtitle || ''} 
                  onChange={e => setFormData({...formData, heroSubtitle: e.target.value})} 
                  className="w-full border border-slate-200 p-3 rounded-lg focus:border-indigo-500 outline-none transition-all text-sm resize-none" 
                />
                <p className="text-[10px] text-slate-400 mt-1">Use a tag <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-[9px] text-slate-600">{"{wholesaleMinQty}"}</code> para exibir o valor mínimo do atacado de forma automática.</p>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pré-visualização do Hero</span>
              <div className="relative h-44 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src={formData.heroBgUrl || 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=85'} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                <div className="relative text-center max-w-md space-y-1">
                  <h3 className="text-white text-xs font-black uppercase tracking-tight leading-tight whitespace-pre-line">
                    {formData.heroTitle || 'Passo Forte no\nAtacado de Calçados.'}
                  </h3>
                  <p className="text-slate-300 text-[9px] line-clamp-2 leading-snug">
                    {(formData.heroSubtitle || '').replace('{wholesaleMinQty}', String(formData.wholesaleMinQty || 3)) || 'Sua melhor vitrine de revenda profissional...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button type="submit" className="bg-slate-900 text-white px-8 py-4 font-bold uppercase hover:bg-slate-800 flex items-center gap-2 tracking-widest rounded-xl transition-all shadow-md cursor-pointer hover:shadow-lg">
            <Save className="w-5 h-5"/> Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
