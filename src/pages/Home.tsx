import React, { useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Layers, 
  TrendingDown, 
  Tag,
  ArrowRight,
  Sparkle
} from 'lucide-react';

export default function Home() {
  const { products, categories, settings } = useStore();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subCategoryQuery = searchParams.get('sub') || '';

  const parsedTitle = useMemo(() => {
    const rawTitle = settings.heroTitle || 'Passo Forte no\nAtacado de Calçados.';
    const parts = rawTitle.split('\n');
    return {
      part1: parts[0] || '',
      part2: parts.slice(1).join('\n') || ''
    };
  }, [settings.heroTitle]);

  const parsedSubtitle = useMemo(() => {
    const rawSub = settings.heroSubtitle || 'Sua melhor vitrine de revenda profissional. Atacado automático ativo a partir de apenas {wholesaleMinQty} pares em todo o carrinho, misturando marcas e tamanhos livremente!';
    return rawSub.replace('{wholesaleMinQty}', String(settings.wholesaleMinQty || 3));
  }, [settings.heroSubtitle, settings.wholesaleMinQty]);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(slug || 'Todos');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>('default'); // default, cheap, expensive
  const [showFilters, setShowFilters] = useState(false);

  // Sync category state with slug changes if any
  React.useEffect(() => {
    if (slug) {
      setSelectedCategory(slug);
    } else {
      setSelectedCategory('Todos');
    }
  }, [slug]);

  // All available shoe sizes for filter pill generation
  const allSizes = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => p.sizes.forEach(s => list.add(s)));
    return Array.from(list).sort();
  }, [products]);

  // Max price limit calculation dynamically
  const dynamicMaxPriceLimit = useMemo(() => {
    if (products.length === 0) return 500;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  React.useEffect(() => {
    setMaxPrice(dynamicMaxPriceLimit);
  }, [dynamicMaxPriceLimit]);

  // Combined product filters
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (!p.active) return false;
        
        // Search filter
        const matchesSearch = 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Category filter
        const matchesCategory = 
          selectedCategory === 'Todos' || 
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        // Subcategory filter
        const matchesSubcategory = 
          !subCategoryQuery || 
          (p.subcategory && p.subcategory.toLowerCase() === subCategoryQuery.toLowerCase());

        // Size filter
        const matchesSize = 
          !selectedSize || 
          p.sizes.includes(selectedSize);

        // Price filter (on current retail price)
        const currentPrice = p.promotionalPrice || p.price;
        const matchesPrice = currentPrice <= maxPrice;

        return matchesSearch && matchesCategory && matchesSubcategory && matchesSize && matchesPrice;
      })
      .sort((a, b) => {
        const pA = a.promotionalPrice || a.price;
        const pB = b.promotionalPrice || b.price;
        if (sortBy === 'cheap') return pA - pB;
        if (sortBy === 'expensive') return pB - pA;
        return b.createdAt - a.createdAt; // Default/Latest
      });
  }, [products, searchTerm, selectedCategory, subCategoryQuery, selectedSize, maxPrice, sortBy]);

  return (
    <div className="flex flex-col gap-20 pb-28 bg-slate-50/50">
      
      {/* Premium Luxury Hero Banner */}
      <section className="relative h-[72vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-30 mix-blend-multiply animate-fadeIn">
          <img 
            src={settings.heroBgUrl || "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=2000&q=80"} 
            alt="Cinematic footwear construction" 
            className="w-full h-full object-cover scale-102 transition-all duration-700"
          />
        </div>
        
        {/* Glowing atmospheric layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50/50 to-transparent" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center space-y-7">
          <motion.div 
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] font-black uppercase tracking-[0.25em]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-405 animate-pulse" /> ALTA MODA ATACADO • QUALIDADE DE FÁBRICA
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white uppercase tracking-tight leading-[0.95] max-w-5xl"
          >
            {parsedTitle.part1 && (
              <>
                <span className="font-serif italic font-light text-slate-100 uppercase tracking-normal">{parsedTitle.part1}</span>
                <br />
              </>
            )}
            {parsedTitle.part2 ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 py-3 font-extrabold whitespace-pre-line">
                {parsedTitle.part2}
              </span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 py-3 font-extrabold">
                Atacado de Calçados.
              </span>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl font-light tracking-wide leading-relaxed"
          >
            {parsedSubtitle.includes(String(settings.wholesaleMinQty)) ? (
              parsedSubtitle.split(String(settings.wholesaleMinQty)).map((text, index, array) => (
                <React.Fragment key={index}>
                  {text}
                  {index < array.length - 1 && <span className="text-amber-300 font-bold">{settings.wholesaleMinQty} pares</span>}
                </React.Fragment>
              ))
            ) : (
              parsedSubtitle
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-3.5"
          >
            <a 
              href="#catalogo" 
              className="inline-flex items-center justify-center gap-2 px-9 py-4 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-97 transition-all uppercase tracking-[0.2em] rounded-xl shadow-[0_15px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              Explorar Catálogo
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link 
              to="/promocoes" 
              className="inline-flex items-center justify-center px-8 py-4 text-xs font-black text-white hover:text-amber-300 transition-all uppercase tracking-[0.15em] rounded-xl border border-white/20 hover:border-amber-450 hover:bg-white/[0.03]"
            >
              Exibir Outlet Ativo
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Filters & Search Area */}
      <section id="catalogo" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        {/* Banner with filters header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquise por tênis, marca, modelo, cano..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 text-xs font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer ${
                showFilters ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white text-slate-750 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filtros {showFilters ? 'Ativos' : 'Avançados'}
            </button>

            <div className="relative">
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-slate-200 pl-4 pr-11 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.15em] text-slate-750 outline-none hover:bg-slate-50 cursor-pointer"
              >
                <option value="default">Mais Recentes</option>
                <option value="cheap">Preço: Menor p/ Maior</option>
                <option value="expensive">Preço: Maior p/ Menor</option>
              </select>
              <div className="absolute right-4 top-4.5 pointer-events-none text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel Collapse */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Category Filter */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-[0.25em] pl-0.5">Filtrar por Categoria</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => { setSelectedCategory('Todos'); setSelectedSize(''); }}
                    className={`px-4.5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      selectedCategory === 'Todos' ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-4.5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'bg-slate-950 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes Filter */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-[0.25em] pl-0.5">Grade / Tamanhos Disponíveis</h3>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => setSelectedSize('')}
                    className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      !selectedSize ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
                    }`}
                  >
                    Todos
                  </button>
                  {allSizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        selectedSize === size ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase text-slate-450 tracking-[0.25em] pl-0.5">Preço Máximo de Varejo</h3>
                  <span className="text-xs font-bold text-slate-800">{formatCurrency(maxPrice)}</span>
                </div>
                <input 
                  type="range"
                  min={50}
                  max={Math.max(500, dynamicMaxPriceLimit)}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-0.5">
                  <span>R$ 50</span>
                  <span>{formatCurrency(dynamicMaxPriceLimit)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action category pill overview */}
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse-glow"></span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-slate-800 pl-0.5">
              Vitrine: <span className="font-serif italic capitalize tracking-normal text-slate-950">{selectedCategory}</span> {subCategoryQuery ? ` > ${subCategoryQuery}` : ''} ({filteredProducts.length} itens)
            </span>
          </div>

          {(searchTerm || selectedSize || selectedCategory !== 'Todos' || subCategoryQuery || maxPrice < dynamicMaxPriceLimit) && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedSize('');
                setMaxPrice(dynamicMaxPriceLimit);
                setSearchParams({});
              }}
              className="text-[9px] font-black uppercase tracking-[0.2em] bg-slate-100 text-slate-500 hover:text-slate-950 hover:bg-amber-100 border border-slate-200/60 hover:border-amber-350 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Resetar Filtros
            </button>
          )}
        </div>

        {/* Custom Premium Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8sm:gap-10">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} wholesaleMinQty={settings.wholesaleMinQty || 3} />
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-slate-350 p-8 max-w-lg mx-auto w-full">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="font-serif italic font-bold text-slate-800 text-lg">Modelo indesejado ou filtro excessivo</p>
              <p className="text-xs text-slate-450 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Nenhum calçado premium atende aos filtros definidos. Tente ampliar de volta a pesquisa ou limpe os filtros para visualizar a vitrine inteira.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const ProductCard: React.FC<{ product: any; wholesaleMinQty: number }> = ({ product, wholesaleMinQty }) => {
  const currentPrice = product.promotionalPrice || product.price;
  
  return (
    <motion.div 
      layout
      className="group flex flex-col bg-white rounded-[2rem] border border-slate-150 overflow-hidden hover:shadow-[0_25px_60px_rgba(15,23,42,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative"
    >
      {/* Dynamic Off retail overlay tag */}
      {product.promotionalPrice && (
        <div className="absolute top-4.5 left-4.5 bg-rose-550 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full z-10 shadow-md flex items-center gap-1">
          <Sparkle className="w-3 h-3 text-white fill-white" /> DESTAQUE
        </div>
      )}

      {/* Stock critical trigger badge */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className="absolute top-4.5 right-4.5 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full z-10 shadow-md">
          Apenas {product.stock} un
        </div>
      )}

      <Link to={`/produto/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50/50 cursor-pointer">
        <img 
          src={product.images[0] || 'https://via.placeholder.com/400'} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <span className="bg-slate-950 text-white font-black uppercase text-[9px] tracking-[0.25em] pl-6 pr-5 py-3.5 rounded-xl shadow-2xl border border-white/15">
            CONFERIR FICHA
          </span>
        </div>
      </Link>

      <div className="p-6 sm:p-7 flex flex-col flex-1">
        {/* Brand details and category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] text-amber-600 font-black uppercase tracking-[0.25em]">{product.brand}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{product.category}</span>
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 leading-tight mb-5 group-hover:text-amber-600 transition-colors uppercase line-clamp-2 min-h-10">
          {product.name}
        </h3>

        {/* Standard and Wholesale split pricing blocks */}
        <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 shrink-0" /> Preço Varejo:
            </span>
            <span className="font-bold text-slate-500 line-through decoration-slate-300">
              {product.promotionalPrice ? formatCurrency(product.price) : ''}
            </span>
            <span className="font-black text-slate-700">{formatCurrency(currentPrice)}</span>
          </div>

          <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 flex items-center justify-between group-hover:bg-gradient-to-r group-hover:from-indigo-950 group-hover:to-slate-950 transition-all duration-300">
            <div>
              <p className="text-[10px] text-amber-400 font-black uppercase tracking-[0.2em]">Atacado de Fábrica</p>
              <p className="text-[9px] text-slate-400 font-light mt-0.5 leading-none">Mínimo {wholesaleMinQty} pares no carrinho.</p>
            </div>
            <span className="font-extrabold text-base text-white">{formatCurrency(product.wholesalePrice)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
