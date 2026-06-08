import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Percent, TrendingDown, Layers, HelpCircle, Save } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function Atacado() {
  const { settings, updateSettings, products } = useStore();
  const [wholesaleMinQty, setWholesaleMinQty] = useState(settings.wholesaleMinQty || 3);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.wholesaleMinQty) {
      setWholesaleMinQty(settings.wholesaleMinQty);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ wholesaleMinQty: Number(wholesaleMinQty) });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
          Configuração de Atacado
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie as regras automáticas de compras em lote e descontos progressivos da JP Calçados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-800 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" /> Regra Geral de Atacado
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                  Quantidade Mínima de Pares (Carrinho Completo)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    min={1}
                    max={100}
                    value={wholesaleMinQty}
                    onChange={e => setWholesaleMinQty(Number(e.target.value))}
                    className="w-32 bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xl font-bold p-4 rounded-xl text-center outline-none transition-all"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-700">Pares ou mais para liberar o Atacado</p>
                    <p className="text-xs text-slate-500">Qualquer combinação de calçados do carrinho ativará a regra.</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 space-y-1">
                  <span className="font-bold">Como funciona a precificação?</span>
                  <p>
                    Quando a soma de unidades de todos os itens no carrinho for maior ou igual a <span className="font-bold">{wholesaleMinQty}</span>, 
                    o sistema automaticamente substituirá o valor de varejo pelo preço de atacado de cada calçado correspondente.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4">
              <button 
                type="submit" 
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-indigo-600 transition-colors rounded-xl shadow-lg hover:shadow-indigo-500/10"
              >
                <Save className="w-5 h-5" /> Salvar Regra
              </button>
              
              {saved && (
                <span className="text-sm font-bold text-emerald-600 animate-pulse">
                  Configurações salvas com sucesso!
                </span>
              )}
            </div>
          </div>
        </form>

        <div className="space-y-6">
          {/* Simulation Preview Widget */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" /> Simulação de Preços
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Veja abaixo como ficará o demonstrativo na vitrine de produtos da loja:
              </p>

              {products.slice(0, 2).map(product => (
                <div key={product.id} className="p-3.5 bg-slate-800 border border-slate-700 rounded-xl space-y-2">
                  <p className="font-bold text-xs truncate uppercase text-slate-300">{product.name}</p>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/60">
                    <span className="text-slate-400">Preço Varejo:</span>
                    <span className="font-bold text-slate-200">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span>Atacado (A partir de {wholesaleMinQty} un):</span>
                    <span>{formatCurrency(product.wholesalePrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
