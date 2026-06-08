import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Check, X, Tag, Percent, DollarSign, ListFilter, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Coupon } from '../../types';

export default function Coupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();

  // Create form state
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'porcentagem' | 'valor'>('porcentagem');
  const [newValue, setNewValue] = useState<number>(0);
  const [newMinOrderValue, setNewMinOrderValue] = useState<string>('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);
  const [editingType, setEditingType] = useState<'porcentagem' | 'valor'>('porcentagem');
  const [editingMinOrderValue, setEditingMinOrderValue] = useState<string>('');
  const [editingActive, setEditingActive] = useState(true);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'active' | 'percentage' | 'fixed'>('all');

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedCode = newCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!formattedCode) return;

    if (newValue <= 0 || (newType === 'porcentagem' && newValue > 100)) {
      alert('Por favor, informe um valor de desconto válido (e de até 100% para tipo porcentagem).');
      return;
    }

    // Check if code already exists
    if (coupons.some(c => c.id === formattedCode)) {
      alert(`O cupom "${formattedCode}" já existe. Escolha outro código.`);
      return;
    }

    const minVal = newMinOrderValue ? parseFloat(newMinOrderValue) : undefined;

    const couponObj: Coupon = {
      id: formattedCode,
      type: newType,
      value: Number(newValue),
      minOrderValue: minVal,
      active: true,
      createdAt: Date.now(),
    };

    await addCoupon(couponObj);

    // Reset Form
    setNewCode('');
    setNewValue(0);
    setNewMinOrderValue('');
    setIsAdding(false);
  };

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setEditingValue(coupon.value);
    setEditingType(coupon.type);
    setEditingActive(coupon.active);
    setEditingMinOrderValue(coupon.minOrderValue ? String(coupon.minOrderValue) : '');
  };

  const saveEdit = async (id: string) => {
    if (editingValue <= 0 || (editingType === 'porcentagem' && editingValue > 100)) {
      alert('Por favor, defina um valor de desconto coerente.');
      return;
    }

    const minVal = editingMinOrderValue ? parseFloat(editingMinOrderValue) : undefined;

    await updateCoupon(id, {
      type: editingType,
      value: Number(editingValue),
      minOrderValue: minVal,
      active: editingActive,
    });

    setEditingId(null);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm(`Tem certeza que gostaria de excluir o cupom de desconto "${id}" permanentemente?`)) {
      await deleteCoupon(id);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    await updateCoupon(coupon.id, { active: !coupon.active });
  };

  const filteredCoupons = coupons.filter(c => {
    if (filter === 'active') return c.active;
    if (filter === 'percentage') return c.type === 'porcentagem';
    if (filter === 'fixed') return c.type === 'valor';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Tag className="w-8 h-8 text-indigo-650" /> Cupons de Desconto
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gere descontos promocionais para compras no carrinho tanto em porcentagem (%) quanto em valor fixo (R$).
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Criar Cupom
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddCoupon} className="bg-white border-2 border-indigo-150 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-50 pb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-650 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Cadastrar Novo Cupom
            </h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 px-2.5 text-[10px] uppercase font-black text-slate-450 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">Código do Cupom</label>
              <input
                required
                type="text"
                placeholder="Ex: DIADASMAE10, BEMVINDO"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold uppercase transition-all"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">Tipo de Desconto</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as 'porcentagem' | 'valor')}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold transition-all"
              >
                <option value="porcentagem">Porcentagem (%)</option>
                <option value="valor">Valor Fixo (R$)</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">
                {newType === 'porcentagem' ? 'Porcentagem (%)' : 'Valor (R$)'}
              </label>
              <input
                required
                type="number"
                min={1}
                max={newType === 'porcentagem' ? 100 : undefined}
                step="any"
                value={newValue || ''}
                onChange={e => setNewValue(parseFloat(e.target.value) || 0)}
                placeholder={newType === 'porcentagem' ? '10' : '15.00'}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold transition-all"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">Valor Min. do Pedido (Opcional)</label>
              <input
                type="number"
                step="any"
                placeholder="Ex: 150.00"
                value={newMinOrderValue}
                onChange={e => setNewMinOrderValue(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-150">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-650 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-indigo-650/15 cursor-pointer transition-all"
            >
              Criar Cupom
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs Row */}
      <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-xl max-w-md">
        <span className="p-2 text-slate-450" title="Filtrar">
          <ListFilter className="w-4 h-4" />
        </span>
        {(['all', 'active', 'percentage', 'fixed'] as const).map((t) => {
          const labels = {
            all: 'Todos',
            active: 'Ativos',
            percentage: 'Porcentagem (%)',
            fixed: 'Valor Fixo (R$)',
          };
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`flex-1 text-[10px] font-black uppercase px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                filter === t ? 'bg-indigo-50 text-indigo-600' : 'text-slate-550 hover:bg-slate-50'
              }`}
            >
              {labels[t]}
            </button>
          );
        })}
      </div>

      {/* List of Coupon Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCoupons.map((coupon) => {
          const isEditing = editingId === coupon.id;

          return (
            <div
              key={coupon.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all flex flex-col justify-between ${
                isEditing ? 'border-indigo-550 ring-2 ring-indigo-500/15' : 'border-slate-200'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Coupon Header Title Block */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Tag className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-850 tracking-wider font-mono">
                        {coupon.id}
                      </h3>
                      <p className="text-[9px] uppercase font-black text-slate-450 mt-0.5 tracking-widest">
                        Cadastrado em {new Date(coupon.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCouponStatus(coupon)}
                    className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                      coupon.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {coupon.active ? 'Ativo' : 'Pausado'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="pt-2 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 pl-1">Tipo</label>
                        <select
                          value={editingType}
                          onChange={e => setEditingType(e.target.value as 'porcentagem' | 'valor')}
                          className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-bold font-mono outline-none"
                        >
                          <option value="porcentagem">Porcentagem (%)</option>
                          <option value="valor">Valor Fixo (R$)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 pl-1">Desconto</label>
                        <input
                          type="number"
                          step="any"
                          value={editingValue}
                          onChange={e => setEditingValue(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-bold font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1 pl-1">Valor Min. Pedido (Opcional)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Ex: 100.00"
                        value={editingMinOrderValue}
                        onChange={e => setEditingMinOrderValue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl font-bold font-mono outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Abatimento Promocional</p>
                      <p className="text-xl font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                        {coupon.type === 'porcentagem' ? (
                          <>
                            <Percent className="w-5 h-5 text-indigo-600 shrink-0" /> {coupon.value}% de desconto
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" /> {formatCurrency(coupon.value)} OFF
                          </>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Requisito de Ativação</p>
                      <p className="text-xs font-bold text-slate-650 mt-1">
                        {coupon.minOrderValue ? (
                          <span>Carrinho ≥ {formatCurrency(coupon.minOrderValue)}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sem valor mínimo</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card actions bottom bar */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-450 hover:text-slate-700 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(coupon.id)}
                      className="p-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-white bg-indigo-650 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-600/10 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Salvar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(coupon)}
                      className="p-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-550 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-200 transition-all cursor-pointer"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Excluir Cupom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredCoupons.length === 0 && (
          <div className="md:col-span-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-450 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nenhum cupom gerado nesta lista</p>
            <p className="text-[11px] text-slate-400 mt-1">Gere novos códigos de abatimento clicando em "Criar Cupom" acima!</p>
          </div>
        )}
      </div>
    </div>
  );
}
