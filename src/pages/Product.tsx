import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, Check, ChevronLeft, ChevronRight, HelpCircle, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, settings, cart } = useStore();
  
  const product = products.find(p => p.id === id);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <h2 className="font-serif italic text-2xl font-bold text-slate-800">Calçado não encontrado</h2>
        <p className="text-slate-450 text-sm mt-2 font-light">O produto solicitado pode ter sido descontinuado ou movido pelo administrador.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 bg-slate-950 text-white font-black uppercase tracking-[0.15em] px-7 py-3.5 rounded-xl text-xs cursor-pointer"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setColorError(true);
      return;
    }
    
    addToCart({
      ...product,
      selectedSize,
      selectedColor: selectedColor || undefined,
      quantity
    });
    
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      navigate('/carrinho');
    }, 1000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const currentRetailPrice = product.promotionalPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
      
      {/* Return button */}
      <button 
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-[10px] font-black text-slate-450 hover:text-slate-950 uppercase tracking-[0.2em] mb-10 cursor-pointer group transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-amber-500" /> Voltar ao catálogo
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
        
        {/* Images Left Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="relative aspect-square bg-white border border-slate-200/80 rounded-[2.5rem] overflow-hidden shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover object-center"
                alt={product.name}
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-5 top-1/2 -translate-y-1/2 p-3.5 bg-white/95 hover:bg-white text-slate-900 rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer border border-slate-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextImage} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-3.5 bg-white/95 hover:bg-white text-slate-900 rounded-full shadow-lg transition-all hover:scale-105 cursor-pointer border border-slate-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  currentImageIndex === idx ? 'border-amber-500 scale-95 shadow-md shadow-amber-500/10' : 'border-slate-200/60'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover animate-fadeIn" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info Right Pane */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
          
          {/* Brand tag & stock status */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] bg-slate-950 border border-white/5 text-amber-400 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.25em]">
              {product.brand}
            </span>
            {product.stock <= 5 ? (
              <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-xl">
                Baixo Estoque ({product.stock} un restante)
              </span>
            ) : (
              <span className="text-[9px] font-black text-emerald-700 uppercase bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-xl">
                Pronta Entrega
              </span>
            )}
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-serif italic font-bold tracking-wide text-slate-950 leading-tight">
              {product.name}
            </h1>
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.25em] mt-3">
              CATEGORIA: <span className="text-slate-700 font-bold">{product.category}</span>
            </p>
          </div>
          
          {/* PRICING TABLE TABLET (PREMIUM ENHANCED) */}
          <div className="bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-7 shadow-xs space-y-4">
            <p className="text-[9px] font-black uppercase text-slate-450 tracking-[0.25em] pl-0.5">Tabela Atacado e Varejo</p>
            
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest block">Preço de Varejo</span>
                <span className="text-[10px] text-slate-400 font-light">Até 2 unidades totais no carrinho</span>
              </div>
              <div className="text-right">
                {product.promotionalPrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through font-bold">{formatCurrency(product.price)}</span>
                    <span className="text-lg font-black text-rose-600">{formatCurrency(product.promotionalPrice)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-black text-slate-900">{formatCurrency(product.price)}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3">
              <div>
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Atacado Exclusivo JP
                </span>
                <span className="text-[10px] text-zinc-500 font-light">Mínimo de {settings.wholesaleMinQty || 3} produtos de toda a loja</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-600 font-mono">{formatCurrency(product.wholesalePrice)}</span>
              </div>
            </div>
          </div>

          {/* Size picker panel */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pl-0.5">
              <span className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-450">Selecionar Grade</span>
              <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-lg">Padrão BR</span>
            </div>
            
            <AnimatePresence>
              {sizeError && (
                <motion.p 
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-black text-rose-500 pl-0.5"
                >
                  ⚠️ Por favor, selecione primeiro o tamanho do calçado.
                </motion.p>
              )}
            </AnimatePresence>
            
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={`py-3.5 text-center border-2 font-black rounded-2xl text-xs font-mono transition-all duration-300 cursor-pointer ${
                    selectedSize === size 
                      ? 'border-amber-500 bg-slate-950 text-amber-400 shadow-md scale-102' 
                      : 'border-slate-200 text-slate-800 hover:border-slate-950 bg-white hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker panel */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pl-0.5">
                <span className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-450">Selecionar Cor</span>
                <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-lg">Cores JP</span>
              </div>
              
              <AnimatePresence>
                {colorError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-black text-rose-500 pl-0.5"
                  >
                    ⚠️ Por favor, selecione primeiro a cor do calçado.
                  </motion.p>
                )}
              </AnimatePresence>
              
              <div className="flex flex-wrap gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setColorError(false);
                    }}
                    className={`px-5 py-3 text-center border-2 font-black rounded-2xl text-xs transition-all duration-300 cursor-pointer ${
                      selectedColor === color 
                        ? 'border-amber-500 bg-slate-950 text-amber-400 shadow-md scale-102' 
                        : 'border-slate-200 text-slate-800 hover:border-slate-950 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector & Add to cart */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <div className="flex border-2 border-slate-200 rounded-2xl h-14 bg-white overflow-hidden w-full sm:w-auto shrink-0 justify-between items-center">
              <button 
                type="button"
                className="px-5 text-slate-450 hover:text-slate-950 hover:bg-slate-50 text-xl font-bold h-full cursor-pointer transition-colors"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <input 
                type="number" 
                value={quantity}
                readOnly
                className="w-14 text-center focus:outline-none font-bold text-slate-900 text-sm font-mono"
              />
              <button 
                type="button"
                className="px-5 text-slate-450 hover:text-slate-950 hover:bg-slate-50 text-xl font-bold h-full cursor-pointer transition-colors"
                onClick={() => setQuantity(q => q + 1)}
              >
                +
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={!product.stock || added}
              className={`w-full h-14 flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs text-white transition-all rounded-2xl shadow-lg border cursor-pointer ${
                added 
                  ? 'bg-emerald-600 border-emerald-600 shadow-emerald-500/15' 
                  : 'bg-slate-950 border-slate-950 hover:bg-amber-550 hover:border-amber-550 hover:text-slate-950 shadow-slate-900/10'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" /> SEPARADO NO CARRINHO
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> ADICIONAR À SACOLA
                </>
              )}
            </button>
          </div>

          {/* Help detail box */}
          <div className="bg-slate-950 border border-white/10 p-5 rounded-[2rem] flex items-start gap-3.5 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 relative z-10">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-450" /> Atacado Automático Integrado
              </span>
              <p className="leading-relaxed text-slate-450 font-light">
                Combine livremente quaisquer marcas, tamanhos ou modelos neste pedido. Ao somar <span className="font-bold text-amber-300">{settings.wholesaleMinQty || 3} produtos</span> na sacola total, as deduções para atacado serão aplicadas instantaneamente no checkout.
              </p>
            </div>
          </div>

          {/* Core Technical description split info */}
          <div className="border-t border-slate-200 pt-8 mt-4 text-slate-600 text-xs space-y-3.5 leading-relaxed">
            <h3 className="font-black text-slate-950 uppercase tracking-[0.2em] pl-0.5">Ficha Técnica &amp; Acabamento</h3>
            <p className="text-slate-650 leading-relaxed text-sm whitespace-pre-line font-light pl-0.5">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
