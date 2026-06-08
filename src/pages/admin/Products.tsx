import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, HelpCircle, Package, ArrowLeft } from 'lucide-react';
import type { Product } from '../../types';

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  const handleEdit = (p: Product) => {
    setFormData(p);
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto? A ação é permanente.')) {
      deleteProduct(id);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '', 
      description: '', 
      sku: '', 
      category: categories[0]?.name || '', 
      subcategory: '', 
      brand: '',
      price: 0, 
      wholesalePrice: 0,
      promotionalPrice: null, 
      stock: 10, 
      weight: 0.8, 
      sizes: ['34', '35', '36', '37', '38', '39', '40', '41', '42'], 
      images: [''],
      active: true
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up images array: trim whitespace and filter out empty strings
    const cleanedImages = (formData.images || [])
      .map(img => img.trim())
      .filter(Boolean);
    
    // If all are empty, fall back to a default sample placeholder
    const finalImages = cleanedImages.length > 0 
      ? cleanedImages 
      : ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'];

    const defaultSku = formData.sku || 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Ensure all numeric and boolean fields are clean and valid
    const submissionData = {
      ...formData,
      sku: defaultSku,
      images: finalImages,
      price: Number(formData.price) || 0,
      wholesalePrice: Number(formData.wholesalePrice) || 0,
      promotionalPrice: formData.promotionalPrice ? (Number(formData.promotionalPrice) || null) : null,
      stock: Number(formData.stock) !== undefined ? (Number(formData.stock) || 0) : 10,
      weight: Number(formData.weight) !== undefined ? (Number(formData.weight) || 0.8) : 0.8,
      category: formData.category || categories[0]?.name || '',
      subcategory: formData.subcategory || '',
      description: formData.description || '',
      active: formData.active !== false
    };

    if (editingId) {
      updateProduct(editingId, submissionData as Partial<Product>);
    } else {
      addProduct({
        ...submissionData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now()
      } as Product);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" /> Cadastro de Produtos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie calçados, estoques, marcações de varejo e atacado para vitrine.
          </p>
        </div>
        
        {!isFormOpen && (
          <button 
            onClick={handleCreate} 
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-slate-900 transition-all shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
          >
            <Plus className="w-5 h-5"/> Cadastrar Calçado
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-4xl">
          <div className="flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-800 cursor-pointer text-xs uppercase font-black tracking-widest" onClick={() => setIsFormOpen(false)}>
            <ArrowLeft className="w-4 h-4" /> Voltar para Lista
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 mb-6">
            {editingId ? 'Editar Detalhes do Calçado' : 'Registrar Novo Calçado'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Basic Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Nome do Calçado</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Tênis Esportivo Casual Star 2"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all font-bold" 
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Descrição</label>
                <textarea 
                  rows={3}
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Características, modelo do cabedal, amortecimento, etc."
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all" 
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Marca</label>
                <input 
                  required 
                  type="text" 
                  value={formData.brand || ''} 
                  onChange={e => setFormData({...formData, brand: e.target.value})} 
                  placeholder="Olympikus, Nike, Adidas, etc."
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all font-bold" 
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Categoria Principal</label>
                <select 
                  required
                  value={formData.category || ''} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none bg-white transition-all font-bold"
                >
                  <option value="" disabled>Selecione uma Categoria</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Subcategoria (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.subcategory || ''} 
                  onChange={e => setFormData({...formData, subcategory: e.target.value})} 
                  placeholder="Ex: Corrida, Casual, Chuteiras"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all font-bold" 
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Peso Estimado (kg)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={formData.weight || 0.8} 
                  onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} 
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all font-bold" 
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Unidades em Estoque</label>
                <input 
                  required 
                  type="number" 
                  value={formData.stock !== undefined ? formData.stock : 10} 
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all font-bold" 
                />
              </div>

              {/* PRICING SYSTEM (VAREJO AND ATACADO SEPARATIONS) */}
              <div className="md:col-span-2 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-indigo-950 uppercase tracking-widest mb-1">Preço Varejo (1 a 2 un) (R$)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={formData.price || 0} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                    placeholder="99.90"
                    className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 text-sm p-3.5 rounded-xl outline-none transition-all font-extrabold text-slate-800" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-teal-950 uppercase tracking-widest mb-1">Preço Atacado (R$)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    value={formData.wholesalePrice || 0} 
                    onChange={e => setFormData({...formData, wholesalePrice: parseFloat(e.target.value)})} 
                    placeholder="79.90"
                    className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 text-sm p-3.5 rounded-xl outline-none transition-all font-extrabold text-emerald-850" 
                  />
                  <span className="text-[10px] text-teal-600 font-bold mt-1 block">Ativado automaticamente conforme regras.</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-rose-950 uppercase tracking-widest mb-1">Preço Promo Varejo (R$ - opcional)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.promotionalPrice || ''} 
                    onChange={e => setFormData({...formData, promotionalPrice: e.target.value ? parseFloat(e.target.value) : null})} 
                    placeholder="Deixa em branco se não houver"
                    className="w-full bg-white border-2 border-slate-200 focus:border-indigo-500 text-sm p-3.5 rounded-xl outline-none transition-all font-extrabold" 
                  />
                </div>
              </div>

              {/* URL Images */}
              <div className="md:col-span-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-widest leading-none">Fotos do Calçado (Múltiplas Imagens)</label>
                    <p className="text-[10px] text-slate-400 mt-1">Insira um ou mais links públicos de imagens (as fotos aparecerão na página de detalhes).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentImages = [...(formData.images || [])];
                      setFormData({ ...formData, images: [...currentImages, ''] });
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition-all bg-indigo-50 hover:bg-indigo-100/50 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Foto
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(formData.images || ['']).map((imgUrl, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-3 rounded-xl border border-slate-200">
                      
                      {/* Thumbnail Preview */}
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 relative">
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-[8px] text-slate-200 text-center font-bold py-0.5">
                          Foto {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 flex gap-2">
                        <input 
                          required={index === 0} 
                          type="url" 
                          placeholder={index === 0 ? "https://exemplo.com/foto-principal.jpg (Obrigatória)" : "https://exemplo.com/foto-adicional.jpg (Opcional)"}
                          value={imgUrl} 
                          onChange={e => {
                            const newImages = [...(formData.images || [''])];
                            newImages[index] = e.target.value;
                            setFormData({ ...formData, images: newImages });
                          }} 
                          className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-xs p-2.5 rounded-lg outline-none font-mono transition-all" 
                        />
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = (formData.images || []).filter((_, i) => i !== index);
                              setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
                            }}
                            className="p-2 text-rose-500 hover:text-rose-750 hover:bg-rose-50 border border-rose-100 rounded-lg transition-all shrink-0 cursor-pointer"
                            title="Remover Imagem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes list separated by commas */}
              <div className="md:col-span-2">
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Tamanhos Disponíveis (separados por vírgula)</label>
                 <input 
                  required 
                  type="text" 
                  value={formData.sizes?.join(', ') || ''} 
                  onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} 
                  placeholder="34, 35, 36, 37, 38, 39, 40, 41, 42"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-sm p-3.5 rounded-xl outline-none transition-all font-bold" 
                />
              </div>

              {/* Is Active selection */}
              <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.active !== undefined ? formData.active : true} 
                  onChange={e => setFormData({...formData, active: e.target.checked})} 
                  className="w-5 h-5 rounded accent-indigo-600"
                 />
                 <div>
                   <label htmlFor="active" className="font-black text-xs text-slate-700 uppercase tracking-wider">Calçado Disponível</label>
                   <p className="text-[10px] text-slate-400">Ativado permite que os clientes comprem e vejam o tênis na vitrine.</p>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
              <button 
                type="submit" 
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-slate-905 shadow-md transition-colors cursor-pointer"
              >
                Salvar Cadastro
              </button>
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)} 
                className="border border-slate-250 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                  <th className="p-4 pl-6">Foto</th>
                  <th className="p-4">Calçado / Referência</th>
                  <th className="p-4">Preço Varejo</th>
                  <th className="p-4">Preço Atacado</th>
                  <th className="p-4 text-center">Un. Estoque</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {products.map(p => {
                  const isLowStock = p.stock <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-xs" />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 uppercase tracking-tight max-w-[240px] truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">
                          Categoria: <span className="text-slate-400">{p.category}</span> {p.subcategory && `> ${p.subcategory}`}
                        </div>
                      </td>
                      <td className="p-4 font-extrabold text-slate-800">
                        {p.promotionalPrice ? (
                          <div className="space-y-0.5">
                            <span className="text-rose-600">{formatCurrency(p.promotionalPrice)}</span>
                            <span className="block text-[10px] text-slate-450 line-through font-normal">{formatCurrency(p.price)}</span>
                          </div>
                        ) : (
                          <span>{formatCurrency(p.price)}</span>
                        )}
                      </td>
                      <td className="p-4 font-black text-emerald-600">
                        {formatCurrency(p.wholesalePrice || p.price * 0.8)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-center justify-center">
                          <span className={`px-2.5 py-1 text-xs font-black rounded-full ${
                            p.stock > 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {p.stock} un
                          </span>
                          {isLowStock && p.stock > 0 && (
                            <span className="text-[9px] font-black text-amber-600 uppercase mt-1 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> Baixo
                            </span>
                          )}
                          {p.stock === 0 && (
                            <span className="text-[9px] font-black text-rose-600 uppercase mt-1">Esgotado</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          {p.active ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">
                              <CheckCircle className="w-3.5 h-3.5" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-55 border border-slate-100 px-2 py-1 rounded">
                              <XCircle className="w-3.5 h-3.5" /> Pausado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleEdit(p)} 
                            title="Editar Calçado"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-805 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id)} 
                            title="Excluir"
                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
