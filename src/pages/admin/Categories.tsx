import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Edit2, Check, X, Folder, Layers, RotateCcw } from 'lucide-react';
import type { Category } from '../../types';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  // New category form state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOrder, setNewOrder] = useState<number>(categories.length + 1);
  const [newSubcategories, setNewSubcategories] = useState('');

  // Editing category state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingOrder, setEditingOrder] = useState<number>(0);
  const [editingActive, setEditingActive] = useState(true);

  // Quick subcategory editing within specific categories
  const [newQuickSub, setNewQuickSub] = useState<{ [id: string]: string }>({});

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const subList = newSubcategories
      .split(',')
      .map(sub => sub.trim())
      .filter(sub => sub.length > 0);

    const categoryObj: Category = {
      id: 'c_' + Math.random().toString(36).substring(2, 10),
      name: newName.trim(),
      active: true,
      order: Number(newOrder) || categories.length + 1,
      subcategories: subList,
    };

    await addCategory(categoryObj);
    
    // Reset form
    setNewName('');
    setNewSubcategories('');
    setNewOrder(categories.length + 2);
    setIsAdding(false);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingOrder(cat.order || 0);
    setEditingActive(cat.active);
  };

  const saveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    await updateCategory(id, {
      name: editingName.trim(),
      order: Number(editingOrder),
      active: editingActive,
    });

    setEditingId(null);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Tem certeza que gostaria de excluir a categoria "${name}" permanentemente?`)) {
      await deleteCategory(id);
    }
  };

  const handleAddSubcategory = async (cat: Category, subName: string) => {
    if (!subName.trim()) return;
    
    const cleanSub = subName.trim();
    if (cat.subcategories.includes(cleanSub)) return;

    const updatedSubs = [...cat.subcategories, cleanSub];
    await updateCategory(cat.id, { subcategories: updatedSubs });
    
    setNewQuickSub(prev => ({ ...prev, [cat.id]: '' }));
  };

  const handleRemoveSubcategory = async (cat: Category, subToRemove: string) => {
    const updatedSubs = cat.subcategories.filter(s => s !== subToRemove);
    await updateCategory(cat.id, { subcategories: updatedSubs });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
            <Folder className="w-8 h-8 text-indigo-600" /> Categorias e Grade
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerecoleção, filtre produtos e defina a estrutura de subcategorias do menu principal.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setNewOrder(categories.length + 1);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddCategory} className="bg-white border-2 border-indigo-150 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-50 pb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-indigo-650 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Cadastrar Nova Categoria
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
            <div className="md:col-span-6 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">Nome da Categoria</label>
              <input
                required
                type="text"
                placeholder="Ex: Masculino, Infantil"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold transition-all"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">Ordem no Menu</label>
              <input
                required
                type="number"
                min={1}
                value={newOrder}
                onChange={e => setNewOrder(Number(e.target.value))}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold transition-all"
              />
            </div>

            <div className="md:col-span-12 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-450 tracking-widest pl-1">
                Subcategorias Iniciais (Separadas por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Casual, Social, Botas, Esportivo"
                value={newSubcategories}
                onChange={e => setNewSubcategories(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white text-xs p-3.5 rounded-xl outline-none font-bold transition-all"
              />
              <p className="text-[10px] text-slate-400 font-semibold italic pl-1">
                Adicione múltiplos marcadores. Você poderá cadastrar mais outros depois individualmente.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="bg-indigo-650 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-indigo-650/15 cursor-pointer transition-all"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      )}

      {/* Categories table-like cards */}
      <div className="grid grid-cols-1 gap-6">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className={`bg-white border rounded-2xl shadow-xs overflow-hidden transition-all duration-300 ${
                isEditing ? 'border-indigo-550 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header area of category card */}
              <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <input
                        required
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 text-xs p-2.5 rounded-xl outline-none font-bold transition-all"
                        placeholder="Nome da categoria"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        required
                        type="number"
                        min={1}
                        value={editingOrder}
                        onChange={e => setEditingOrder(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 focus:border-indigo-500 text-xs p-2.5 rounded-xl outline-none font-bold transition-all"
                        placeholder="Ordem"
                      />
                    </div>
                    <div className="sm:col-span-3 flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-750 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingActive}
                          onChange={e => setEditingActive(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-550"
                        />
                        Ativa para Compras
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-mono text-[10px] font-black">
                      #{cat.order || 0}
                    </span>
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-850 tracking-wider">
                        {cat.name}
                      </h3>
                      <div className="flex gap-2 items-center mt-0.5">
                        <span className={`inline-flex items-center w-2 h-2 rounded-full ${cat.active ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">
                          {cat.active ? 'Exibido e Ativo' : 'Inativo no Menu'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Header controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-slate-450 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                        title="Cancelar Edição"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        className="p-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/10"
                        title="Salvar Alterações"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 text-slate-550 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                        title="Editar Categoria"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-2 text-slate-405 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

              </div>

              {/* Subcategories control area containing tag management */}
              <div className="p-5 sm:p-6 bg-white space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-450">
                    Subcategorias Vinculadas ({cat.subcategories?.length || 0})
                  </h4>
                </div>

                {/* Subcategory Pill labels */}
                <div className="flex flex-wrap gap-2">
                  {cat.subcategories && cat.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-150 pl-3 pr-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide text-slate-650 hover:bg-slate-100 transition-colors"
                    >
                      {sub}
                      <button
                        onClick={() => handleRemoveSubcategory(cat, sub)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-slate-450 hover:text-rose-600 hover:bg-slate-200 transition-all cursor-pointer"
                        title={`Remover ${sub}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}

                  {(!cat.subcategories || cat.subcategories.length === 0) && (
                    <p className="text-xs text-slate-400 italic">Nenhuma subcategoria vinculada para este nível.</p>
                  )}
                </div>

                {/* Quick Add Form Row */}
                <div className="pt-3 border-t border-slate-100 max-w-sm">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Adicionar subcategoria rápida..."
                      value={newQuickSub[cat.id] || ''}
                      onChange={e => setNewQuickSub(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategory(cat, newQuickSub[cat.id] || '');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-[11px] font-bold p-2.5 pl-4 pr-10 rounded-xl outline-none uppercase tracking-wide transition-all"
                    />
                    <button
                      onClick={() => handleAddSubcategory(cat, newQuickSub[cat.id] || '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-650 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Anexar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
