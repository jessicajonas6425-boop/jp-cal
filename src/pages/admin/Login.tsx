import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ShieldCheck, Lock, Mail, ChevronRight, Zap, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formattedEmail = email.toLowerCase().trim();

      // Fallback local credentials
      if ((formattedEmail === 'jp@x.com' || formattedEmail === 'jorgepancieridasilva@gmail.com') && password === 'jp4321') {
        localStorage.setItem('isAdminAuthed', 'true');
        navigate('/admin');
        return;
      }

      // Live Firestore check
      const adminDocRef = doc(db, 'admins', formattedEmail);
      const docSnap = await getDoc(adminDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.password === password) {
          localStorage.setItem('isAdminAuthed', 'true');
          navigate('/admin');
          return;
        }
      }

      setError('Credenciais inválidas. Registre seu e-mail na coleção "admins" no console Firebase.');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao autenticar com o banco em tempo real. Verifique as regras de segurança.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Background Decorative Halo Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.05),transparent_50%)]" />

      {/* Decorative Brand Header */}
      <div className="mb-8 text-center z-10 animate-fadeIn">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">
            Painel Administrativo Autorizado
          </span>
        </div>
        <img 
          src="https://i.postimg.cc/tTngPGq6/Chat-GPT-Image-8-de-jun-de-2026-15-18-21.png" 
          alt="JP Calçados Logo" 
          className="h-14 w-auto object-contain mx-auto mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.1)]"
          referrerPolicy="no-referrer"
        />
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-100 pl-[0.3em]">JP CALÇADOS</h2>
      </div>

      {/* Core Luxury Floating Card */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-8 sm:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] z-10 relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />
        
        <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-widest text-center mb-1">Acesso Restrito</h1>
        <p className="text-slate-400 text-center text-xs font-medium mb-8">Digite suas credenciais administrativas de tempo real</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 font-bold text-xs text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail Administrativo</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 outline-none"
                placeholder="jorgepancieridasilva@gmail.com"
                required 
                disabled={isLoading}
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-650" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha Segura</label>
            <div className="relative">
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-600 outline-none"
                placeholder="••••••••"
                required 
                disabled={isLoading}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-650" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-650 text-white hover:bg-indigo-600 active:scale-[0.98] font-black uppercase tracking-widest py-4.5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-indigo-650/20 transition-all cursor-pointer mt-8"
          >
            {isLoading ? 'Autenticando...' : 'Entrar no Painel'}
            <ChevronRight className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={() => navigate('/')}
            className="w-full bg-transparent text-slate-400 hover:text-white hover:bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 active:scale-[0.98] font-black uppercase tracking-widest py-4.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer mt-3.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Site
          </button>
        </form>
      </div>

      {/* Footer stamps */}
      <div className="flex gap-4 items-center text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-12 z-10">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Firebase Conectado
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Tempo Real Ativo
        </span>
      </div>
    </div>
  );
}

