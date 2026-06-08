import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  Sparkles, 
  Instagram, 
  Facebook, 
  PhoneCall, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPhone } from '../../lib/utils';

export default function UserLayout() {
  const { cart, settings, categories } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/55 text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Automated Celebration/Notification Ribbon */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-amber-500/15 text-white py-2.5 px-4 text-center flex items-center justify-center gap-2 overflow-hidden relative">
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse-glow shrink-0" />
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-100">
          Super Atacado Automático JP: Adicione {settings.wholesaleMinQty || 3} produtos para liberar descontos de fábrica!
        </span>
        <span className="hidden sm:inline bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full ml-1.5 tracking-wider">
          ATIVO
        </span>
      </div>

      {/* Main Glassmorphic Luxury Header */}
      <header className="bg-white/85 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 transition-all shadow-[0_2px_20px_rgba(15,23,42,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-22">
            
            {/* Logo area */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 mr-2 text-slate-700 hover:text-amber-500 lg:hidden focus:outline-none cursor-pointer"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to="/" className="flex items-center gap-3.5 select-none group">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src="https://i.postimg.cc/tTngPGq6/Chat-GPT-Image-8-de-jun-de-2026-15-18-21.png" 
                    alt="JP Calçados" 
                    className="h-11 sm:h-13 w-auto object-contain transition-transform duration-500 group-hover:scale-106"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-serif italic font-bold tracking-wide text-slate-950 leading-none group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    JP Calçados
                  </span>
                  <span className="text-[8.5px] uppercase font-black text-slate-450 tracking-[0.3em] mt-1 pl-0.5">
                    DIRETORIO DE ATACADO DE REVENDA
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Navigation links - Outlined in premium style */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link 
                to="/" 
                className={`relative py-3 px-1 text-xs uppercase tracking-[0.25em] font-black transition-colors group ${
                  location.pathname === '/' ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'
                }`}
              >
                Início
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 rounded-full transition-transform duration-350 origin-left ${
                  location.pathname === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>

              {categories.filter(c => c.active).map(cat => {
                const isCatActive = location.pathname.includes(`/categoria/${cat.name}`);
                return (
                  <div key={cat.id} className="relative group/cat py-3">
                    <Link 
                      to={`/categoria/${cat.name}`} 
                      className={`relative py-2 text-xs uppercase tracking-[0.2em] font-black transition-colors flex items-center gap-1 ${
                        isCatActive ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'
                      }`}
                    >
                      {cat.name}
                      <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 rounded-full transition-transform duration-350 origin-left ${
                        isCatActive ? 'scale-x-100' : 'scale-x-0 group-hover/cat:scale-x-100'
                      }`} />
                    </Link>

                    {/* Premium Dropdown with subcategories */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-60 bg-white/95 backdrop-blur-2xl border border-slate-100/90 rounded-2xl shadow-xl py-3 px-2 hidden group-hover/cat:block animate-fadeIn pointer-events-auto transition-all duration-200">
                        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-white border-t border-l border-slate-100/80" />
                        <div className="relative z-10 space-y-0.5">
                          {cat.subcategories.map(sub => (
                            <Link 
                              key={sub}
                              to={`/categoria/${cat.name}?sub=${sub}`}
                              className="block px-4 py-2.5 text-[10px] text-slate-500 rounded-xl hover:bg-amber-50 hover:text-amber-600 font-black uppercase tracking-[0.15em] transition-all"
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link 
                to="/promocoes" 
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.2em] font-black transition-all flex items-center gap-1.5 ${
                  location.pathname === '/promocoes' 
                    ? 'bg-amber-550 text-white shadow-lg shadow-amber-500/20' 
                    : 'text-amber-600 bg-amber-50 hover:bg-amber-550 hover:text-white hover:shadow-lg hover:shadow-amber-550/25'
                }`}
              >
                Ofertas Imbatíveis
              </Link>
            </nav>

            {/* Shopping status and mini basket trigger */}
            <div className="flex items-center space-x-2">
              <Link 
                to="/carrinho" 
                className="p-3 bg-slate-950 text-white hover:bg-amber-550 transition-all rounded-xl relative flex items-center gap-2.5 shadow-md hover:shadow-lg shadow-slate-950/10 group border border-slate-900 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-white group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline text-xs font-black uppercase tracking-[0.2em]">Sacola</span>
                {cartItemCount > 0 ? (
                  <span className="bg-amber-450 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full absolute -top-1.5 -right-1.5 shadow-md shadow-amber-500/35 transition-transform animate-pulse">
                    {cartItemCount}
                  </span>
                ) : (
                  <span className="hidden sm:inline bg-slate-850 text-slate-500 text-[9px] px-2 py-0.5 rounded-full">0</span>
                )}
              </Link>
            </div>
          </div>
          
          {/* Mobile menu collapsible */}
          {isMenuOpen && (
            <div className="lg:hidden py-6 border border-slate-100 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl mt-2 px-4 space-y-4 animate-fadeIn max-h-[65vh] overflow-y-auto scrollbar-thin">
              <nav className="flex flex-col space-y-1">
                <Link 
                  to="/" 
                  className={`px-4 py-3 rounded-xl text-xs uppercase tracking-[0.2em] font-black transition-all ${
                    location.pathname === '/' ? 'bg-amber-50/50 text-amber-600 font-extrabold' : 'text-slate-650 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Início
                </Link>

                {categories.filter(c => c.active).map(cat => {
                  const isCatActive = location.pathname.includes(`/categoria/${cat.name}`);
                  return (
                    <div key={cat.id} className="flex flex-col">
                      <Link 
                        to={`/categoria/${cat.name}`} 
                        className={`px-4 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-black transition-all ${
                          isCatActive ? 'bg-amber-50/50 text-amber-600 font-extrabold' : 'text-slate-650 hover:bg-slate-50'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                      
                      {/* Subcategories internal listing */}
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="pl-6 flex flex-col border-l border-slate-100 ml-6 py-1 space-y-1">
                          {cat.subcategories.map(sub => (
                            <Link 
                              key={sub}
                              to={`/categoria/${cat.name}?sub=${sub}`}
                              className="px-3 py-2 text-[10px] text-slate-500 hover:text-amber-500 font-black uppercase tracking-wider transition-all"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                <Link 
                  to="/promocoes" 
                  className={`px-4 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-black text-rose-600 bg-rose-50 transition-all ${
                    location.pathname === '/promocoes' ? 'bg-rose-550 text-white font-extrabold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ofertas Imbatíveis
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Core Stage */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Luxury Minimalist Footer */}
      <footer className="bg-slate-950 text-slate-400 pt-20 pb-12 border-t border-slate-900 relative">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16">
          
          {/* Column A: Branding */}
          <div className="space-y-5">
            <h3 className="font-serif italic text-white text-2xl font-bold tracking-wide">
              {settings.storeName}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed font-light">
              Distribuição oficial de calçados direto da fábrica para lojistas, sapateiras e revendedores em todo o Brasil. Qualidade, solados premium e conforto inigualável.
            </p>
            <div className="flex items-center gap-3 pt-3">
              <a 
                href={settings.instagram?.startsWith('http') ? settings.instagram : `https://www.instagram.com/${settings.instagram?.replace('@', '')}`}
                target="_blank" 
                rel="noreferrer" 
                className="p-2.5 bg-slate-900 hover:bg-amber-550 hover:text-slate-950 rounded-xl text-white transition-all duration-300"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 bg-slate-900 hover:bg-amber-550 hover:text-slate-950 rounded-xl text-white transition-all duration-300" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column B: Contact details */}
          <div className="space-y-5">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] pl-0.5">Contato &amp; Suporte</h4>
            <div className="h-[1.5px] w-8 bg-amber-550 rounded" />
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-center gap-3">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium">{formatPhone(settings.whatsapp)}</span>
              </li>
              <li className="flex items-start gap-3 leading-relaxed">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-light">{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Column C: Internal Links */}
          <div className="space-y-5">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] pl-0.5">Navegação</h4>
            <div className="h-[1.5px] w-8 bg-amber-550 rounded" />
            <ul className="space-y-3 text-xs font-light">
              <li><Link to="/termos" className="hover:text-amber-400 transition-colors">Termos de Atacado</Link></li>
              <li><Link to="/privacidade" className="hover:text-amber-400 transition-colors">Normativos de Privacidade</Link></li>
              <li><Link to="/trocas" className="hover:text-amber-400 transition-colors">Garantia e Devoluções</Link></li>
              <li>
                <Link 
                  to="/admin" 
                  className="mt-3 text-amber-400 hover:text-slate-950 hover:bg-amber-450 font-black tracking-[0.15em] uppercase text-[9px] border border-amber-500/25 px-3.5 py-2 rounded-xl inline-block transition-all duration-300"
                >
                  ⚙️ Painel Interno (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column D: Working Days */}
          <div className="space-y-5">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] pl-0.5">Atendimento</h4>
            <div className="h-[1.5px] w-8 bg-amber-550 rounded" />
            <p className="text-xs leading-relaxed flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-light">{settings.businessHours}</span>
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wider">
              Pedidos efetuados aos sábados e domingos são processados no dia útil subsequente.
            </p>
          </div>
        </div>

        {/* Footnote statement */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-slate-900/60 text-[10px] text-center text-slate-600 font-extrabold uppercase tracking-[0.3em] pl-[0.3em]">
          &copy; {new Date().getFullYear()} {settings.storeName}. Distribuição Autorizada Oficial. Todos os Direitos Reservados.
        </div>
      </footer>
    </div>
  );
}
