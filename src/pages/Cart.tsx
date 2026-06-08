import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, settings } = useStore();
  const navigate = useNavigate();
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  // 1. Calculate general numbers
  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const minWholesaleQty = settings.wholesaleMinQty || 3;
  const isWholesaleActive = totalItems >= minWholesaleQty;

  // 2. Play beautiful confetti animations exactly when they cross the wholesale threshold
  useEffect(() => {
    if (isWholesaleActive && !hasFiredConfetti) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899']
        });
      });
      setHasFiredConfetti(true);
    } else if (!isWholesaleActive && hasFiredConfetti) {
      // Reset so that they can re-unlock if they add back
      setHasFiredConfetti(false);
    }
  }, [isWholesaleActive, hasFiredConfetti, minWholesaleQty]);

  // 3. Subtotal depending on Wholesale Mode
  const { subtotal, totalRegularPrice, savedAmount } = useMemo(() => {
    let sub = 0;
    let regularTotal = 0;

    cart.forEach(item => {
      const retailPrice = item.promotionalPrice || item.price;
      const wholesalePrice = item.wholesalePrice || (item.price * 0.8);
      
      regularTotal += retailPrice * item.quantity;
      sub += (isWholesaleActive ? wholesalePrice : retailPrice) * item.quantity;
    });

    const saved = isWholesaleActive ? Math.max(0, regularTotal - sub) : 0;

    return { 
      subtotal: sub, 
      totalRegularPrice: regularTotal, 
      savedAmount: saved 
    };
  }, [cart, isWholesaleActive]);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-slate-50/50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-amber-450/10 rounded-full blur-xl" />
            <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto" />
            <div className="absolute -top-1.5 -right-1.5 bg-slate-950 font-mono text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-black">0</div>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif italic text-2xl font-bold text-slate-800">Sua sacola está vazia</h2>
            <p className="text-slate-500 text-xs font-light max-w-sm mx-auto leading-relaxed">
              Você ainda não incluiu nenhum calçado premium para cotação. Acesse nossa vitrine agora e garanta preços de atacado na sua revenda!
            </p>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center bg-slate-950 text-white font-black uppercase tracking-[0.2em] px-8 py-4.5 rounded-xl text-[10px] hover:bg-amber-550 hover:text-slate-950 transition-all shadow-lg shadow-slate-950/10 cursor-pointer"
          >
            Explorar Coleção Comercial
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      
      {/* Page Title & Status Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-serif italic font-bold tracking-wide text-slate-950">
          Sacola de Compras
        </h1>
        <p className="text-slate-450 text-xs font-semibold uppercase tracking-widest mt-1.5 pl-0.5">
          Revise seus lotes selecionados e adicione pares para atingir a cota de atacado do distribuidor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Cart Item list Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* WHOLESALE PROGRESS NOTIFIER COMPONENT */}
          <motion.div 
            layout
            className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              isWholesaleActive 
                ? 'bg-slate-950 text-white border-white/5 shadow-xl' 
                : 'bg-white border-slate-200 text-slate-800 shadow-sm'
            }`}
          >
            {isWholesaleActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            )}
            <div className="flex gap-4">
              <div className="shrink-0 pt-0.5">
                {isWholesaleActive ? (
                  <CheckCircle2 className="w-6 h-6 text-amber-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-6 h-6 text-amber-650" />
                )}
              </div>
              <div className="space-y-1 w-full relative z-10">
                <span className={`text-xs font-black uppercase tracking-[0.2em] block ${isWholesaleActive ? 'text-amber-400' : 'text-slate-850'}`}>
                  {isWholesaleActive ? 'Desconto Atacado Desbloqueado com Sucesso!' : 'Distribuição de Fábrica por Atacado'}
                </span>
                
                <p className={`text-xs ${isWholesaleActive ? 'text-slate-350 font-light' : 'text-slate-550'}`}>
                  Seu pedido possui atualmente <span className="font-extrabold">{totalItems} {totalItems === 1 ? 'par' : 'pares'}</span> em andamento.
                </p>

                {/* Progress bar and counter metrics */}
                {!isWholesaleActive ? (
                  <div className="space-y-3 pt-3">
                    <p className="text-xs font-bold text-slate-700">
                      Falta apenas <span className="text-amber-600 font-extrabold text-sm">{minWholesaleQty - totalItems} par{minWholesaleQty - totalItems === 1 ? '' : 'es'}</span> para ativar descontos de atacado em todos os itens!
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(totalItems / minWholesaleQty) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2">
                    <p className="text-xs font-light text-slate-450 leading-relaxed max-w-xl">
                      Cotação aprovada na modalidade Atacado Comercial. Seus valores unitários foram reajustados para as menores tarifas líquidas de calçados de fábrica.
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-3.5 bg-amber-400 text-slate-950 text-[9px] font-black tracking-[0.2em] uppercase px-3.5 py-1 rounded-full shadow-md shadow-amber-500/10">
                      ATACADO PREMIUM ATIVO
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Cart Table List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-slate-50 border-b border-slate-200 font-black uppercase text-[10px] text-slate-400 tracking-[0.2em] pl-7">
              <div className="col-span-6 pl-2">Calçado</div>
              <div className="col-span-2 text-center">Quantidade</div>
              <div className="col-span-3 text-right">Subtotal Especial</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {cart.map(item => {
                const retailPrice = item.promotionalPrice || item.price;
                const wholesalePrice = item.wholesalePrice || (item.price * 0.8);
                const appliedPrice = isWholesaleActive ? wholesalePrice : retailPrice;

                return (
                  <div key={item.cartItemId} className="grid grid-cols-1 md:grid-cols-12 gap-4 col-span-12 p-5 sm:p-6 items-center hover:bg-slate-50/50 transition-colors">
                    
                    {/* Footwear info card and name */}
                    <div className="col-span-1 md:col-span-6 flex gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover animate-fadeIn" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-600 mb-0.5">
                          {item.brand}
                        </span>
                        <h3 className="font-bold text-slate-850 uppercase text-sm leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1 font-semibold">Tamanho: <span className="text-slate-950 font-black">{item.selectedSize}</span></p>
                        
                        {/* Mobile pricing spec only */}
                        <div className="md:hidden mt-2.5 flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400 font-medium font-mono">Unitário:</span>
                          <span className={`font-black ${isWholesaleActive ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {formatCurrency(appliedPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Item Quantities picker */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                      <div className="flex border-2 border-slate-200 bg-white rounded-xl overflow-hidden h-11 items-center shrink-0">
                        <button 
                          type="button"
                          className="px-3.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm h-full cursor-pointer transition-colors"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                        >-</button>
                        <input 
                          type="number" 
                          value={item.quantity}
                          readOnly
                          className="w-10 text-center focus:outline-none text-xs font-black text-slate-800 font-mono"
                        />
                        <button 
                          type="button"
                          className="px-3.5 text-slate-405 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm h-full cursor-pointer transition-colors"
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                        >+</button>
                      </div>
                    </div>
                    
                    {/* Total Price calculations metrics desktop */}
                    <div className="hidden md:block col-span-3 text-right pr-2">
                      <span className="text-slate-400 text-xs block font-semibold">
                        {item.quantity}x {formatCurrency(appliedPrice)}
                      </span>
                      <span className={`font-black text-sm block mt-0.5 font-mono ${isWholesaleActive ? 'text-emerald-600' : 'text-slate-950'}`}>
                        {formatCurrency(appliedPrice * item.quantity)}
                      </span>
                    </div>
                    
                    {/* Delete trigger */}
                    <div className="col-span-1 flex justify-end">
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        title="Remover Calçado"
                        className="p-2 text-slate-450 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary side Column */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-8 shadow-sm space-y-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-[10px] font-black uppercase text-slate-450 tracking-[0.25em] border-b border-slate-100 pb-4">
              Resumo do Distribuidor
            </h2>

            <div className="space-y-4 text-xs font-semibold text-slate-650">
              
              <div className="flex justify-between items-center text-slate-700">
                <span>Modalidade</span>
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                  isWholesaleActive 
                    ? 'bg-slate-950 text-amber-400 border-white/5 shadow-sm' 
                    : 'bg-slate-50 text-slate-750 border-slate-200'
                }`}>
                  {isWholesaleActive ? 'Atacado Líquido' : 'Varejo Padrão'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Grade Geral</span>
                <span className="text-slate-900 font-black">{totalItems} {totalItems === 1 ? 'par' : 'pares'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Tabela de Varejo</span>
                <span className="text-slate-900 font-extrabold font-mono">{formatCurrency(totalRegularPrice)}</span>
              </div>

              {/* Saved details */}
              {isWholesaleActive && savedAmount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl"
                >
                  <span className="font-black text-[10px] uppercase tracking-wider">Desconto Atacado (Lote)</span>
                  <span className="font-extrabold text-xs font-mono">-{formatCurrency(savedAmount)}</span>
                </motion.div>
              )}
              
              <p className="text-[10px] text-slate-400 italic pt-1 leading-relaxed">
                As cotações de transporte PAC municipal e SEDEX nacional serão listadas com preenchimento de endereço na fase de finalização.
              </p>
            </div>
            
            <div className="border-t border-slate-150 pt-5 flex justify-between items-end">
              <div>
                <span className="font-black uppercase tracking-[0.15em] text-[9px] text-slate-450 block mb-0.5">Total Líquido</span>
                <span className="text-[10px] text-zinc-400 font-semibold">({totalItems} produtos)</span>
              </div>
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isWholesaleActive ? 'text-emerald-600' : 'text-slate-950'}`}>
                {formatCurrency(subtotal)}
              </span>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full inline-flex items-center justify-center gap-3 bg-slate-950 hover:bg-amber-550 hover:text-slate-950 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl text-[10px] transition-all duration-300 shadow-lg hover:shadow-amber-500/10 cursor-pointer"
            >
              Avançar p/ Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <Link 
              to="/" 
              className="block text-center text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-amber-600 transition-colors hover:underline"
            >
              Retornar ao Catálogo Comercial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
