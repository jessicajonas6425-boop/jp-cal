import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  LayoutDashboard, 
  ShoppingBag, 
  Folders, 
  Settings as SettingsIcon, 
  LogOut, 
  MonitorSmartphone, 
  Percent, 
  Menu, 
  X,
  Tag
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthed');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'PDV', path: '/admin/pdv', icon: MonitorSmartphone },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
    { name: 'Produtos', path: '/admin/produtos', icon: Package },
    { name: 'Categorias', path: '/admin/categorias', icon: Folders },
    { name: 'Cupons', path: '/admin/cupons', icon: Tag },
    { name: 'Atacado', path: '/admin/atacado', icon: Percent },
    { name: 'Configurações', path: '/admin/configuracoes', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between w-full h-16 px-4 bg-slate-900 text-white fixed top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-200 hover:text-white rounded focus:outline-none"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-bold text-sm tracking-tight truncate uppercase max-w-[200px]">
            {settings.storeName}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-xs font-bold text-red-400 border border-red-900/40 px-2.5 py-1.5 rounded bg-red-950/20"
        >
          Sair
        </button>
      </div>

      {/* Sidebar background overlay for mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar - Persistent on Desktop, Sliding on Mobile */}
      <aside className={`
        w-64 bg-slate-900 text-white flex flex-col fixed md:sticky top-0 bottom-0 left-0 z-50 h-screen
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity">
            <img 
              src="https://i.postimg.cc/tTngPGq6/Chat-GPT-Image-8-de-jun-de-2026-15-18-21.png" 
              alt="JP Calçados Logo" 
              className="h-9 w-auto object-contain filter brightness-110"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h2 className="text-base font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">
                JP Calçados
              </h2>
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-0.5 leading-none">
                Painel de Controle
              </p>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all border ${
                  isActive 
                    ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-bold shadow-indigo-950/20' 
                    : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-indigo-400' : 'text-slate-400'}`} />
                <span className="text-sm tracking-wide">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/35 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Voltar ao Site</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-lg transition-colors mt-2"
          >
            <span className="text-sm font-bold uppercase tracking-wider">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-x-hidden">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
