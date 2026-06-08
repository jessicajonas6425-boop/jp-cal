import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Volume2, VolumeX } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  const { setHasSeenSplash, settings } = useStore();
  const [loadingStep, setLoadingStep] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound synthesis function mimicking a designer synth (using pure Web Audio API)
  const playLuxuryChime = (isExit = false) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Pentatonic premium luxury chords (major 7th / 9th stack)
      // If exiting, play a rising warm space glide. Else, a high-end chime.
      const frequencies = isExit 
        ? [130.81, 196.00, 261.63, 329.63, 392.00, 523.25, 659.25] // C3, G3, C4, E4, G4, C5, E5 (Full cinematic lift)
        : [185.00, 277.18, 369.99, 554.37, 698.46]; // F#3, C#4, F#4, C#5, F5 (Elegant boutique chime)
      
      const duration = isExit ? 4.5 : 3.0;

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const oscMirror = ctx.createOscillator();
          const gainNode = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          oscMirror.type = 'triangle';
          oscMirror.frequency.setValueAtTime(freq * 1.005, ctx.currentTime); // Slight detune for analog chorus thickness
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1400, ctx.currentTime);
          filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + duration);
          
          // Smooth volume envelope (swell and slow release)
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(isExit ? 0.08 : 0.05, ctx.currentTime + 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          
          osc.connect(filter);
          oscMirror.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          oscMirror.start();
          osc.stop(ctx.currentTime + duration);
          oscMirror.stop(ctx.currentTime + duration);
        }, index * (isExit ? 80 : 130)); // Delay arpeggio notes
      });
    } catch (e) {
      console.warn('Audio context creation deferred until user interaction.', e);
    }
  };

  // Play entry sound as soon as page interactive state mounts
  useEffect(() => {
    const playInitial = () => {
      playLuxuryChime(false);
      window.removeEventListener('pointerdown', playInitial);
    };
    window.addEventListener('pointerdown', playInitial);
    return () => {
      window.removeEventListener('pointerdown', playInitial);
    };
  }, [soundEnabled]);

  // Starfield warp visual effects on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
      color: string;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Spawn elegant galaxy dust particles
    const numParticles = 120;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width,
        size: Math.random() * 1.5 + 0.8,
        speed: Math.random() * 1.6 + 0.8,
        color: Math.random() > 0.4 ? '#f59e0b' : '#6366f1' // Golden amber vs Luxury indigo
      });
    }

    const render = () => {
      // Semi-transparent clears create gorgeous warp speed blur trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      particles.forEach((p) => {
        p.z -= p.speed;
        if (p.z <= 0) {
          p.z = canvas.width;
          p.x = Math.random() * canvas.width - canvas.width / 2;
          p.y = Math.random() * canvas.height - canvas.height / 2;
        }

        // Project coordinate math
        const px = (p.x / p.z) * canvas.width * 0.7;
        const py = (p.y / p.z) * canvas.height * 0.7;
        const radius = (p.size * (canvas.width - p.z)) / canvas.width;

        // If visible within bounding container
        if (px > -canvas.width / 2 && px < canvas.width / 2 && py > -canvas.height / 2 && py < canvas.height / 2) {
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.color === '#f59e0b' ? 12 : 6;
          ctx.shadowColor = p.color;
          ctx.fill();

          // Soft ambient speed tails
          const tailSize = radius * 4.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + (px / p.z) * tailSize, py + (py / p.z) * tailSize);
          ctx.strokeStyle = p.color === '#f59e0b' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(99, 102, 241, 0.14)';
          ctx.lineWidth = radius * 0.5;
          ctx.stroke();
        }
      });

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // High-end cinematic loading updates matching the 6 seconds
  useEffect(() => {
    const steps = [
      'Iniciando conexão segura com a fábrica...',
      'Sincronizando lotes exclusivos de calçados...',
      'Verificando disponibilidade de estoque premium...',
      'Aplicando tabela automática de descontos de atacado...',
      'Preparando vitrine autorizada de distribuição...',
      'Pronto! Bem-vindo à JP Calçados.'
    ];

    const intervals = [1000, 2000, 3200, 4200, 5200, 5800];
    const timers = intervals.map((ms, idx) => 
      setTimeout(() => setLoadingStep(idx), ms)
    );

    const mainTimer = setTimeout(() => {
      handleComplete();
    }, 6000);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearTimeout(mainTimer);
    };
  }, [navigate]);

  const handleComplete = () => {
    playLuxuryChime(true);
    setHasSeenSplash(true);
    navigate('/');
  };

  // 3D Tilt calculation on mouse coordinate change (Parallax)
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    // Calculate off-center percentages
    const x = (clientX / width - 0.5) * 14; 
    const y = (clientY / height - 0.5) * -14;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 }); // Snap back elegantly
  };

  const stepsText = [
    'Iniciando conexão segura com a fábrica...',
    'Sincronizando lotes exclusivos de calçados...',
    'Verificando disponibilidade de estoque de alta costura...',
    'Aplicando tabela automática de descontos de atacado...',
    'Preparando vitrine autorizada de distribuição...',
    'Pronto! Bem-vindo ao universo JP.'
  ];

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-between overflow-hidden z-[100] px-6 py-12 select-none"
    >
      {/* 3D Warp speed background canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 opacity-80 pointer-events-none" 
      />

      {/* Atmospheric glowing overlay halo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950" />
        
        {/* Dynamic magenta/gold flare pulses */}
        <motion.div 
          animate={{ opacity: [0.12, 0.3, 0.12], y: [0, -30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[20%] right-[20%] h-[50%] bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-amber-500/12 via-indigo-500/5 to-transparent blur-3xl animate-pulse-glow"
        />
      </div>

      {/* Top Header - Sound switch and Official Seal */}
      <div className="z-10 w-full max-w-7xl flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-100/80">
            Distribuidora Oficial Certificada
          </span>
        </motion.div>

        {/* Audio Mute Switch */}
        <motion.button 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-amber-200/80 hover:text-white rounded-full border border-white/5 backdrop-blur-md cursor-pointer transition-colors"
          title={soundEnabled ? "Desativar Áudio Imersivo" : "Ativar Áudio Imersivo"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Centerpiece Luxury Glass Card Container */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 max-w-lg w-full">
        
        {/* Ambient back lighting aura */}
        <div className="absolute w-[380px] h-[380px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none animate-pulse-glow" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => playLuxuryChime(false)}
          className="relative w-full p-8 sm:p-12 rounded-[2.5rem] border border-white/10 bg-slate-900/35 backdrop-blur-2xl shadow-[0_50px_100px_rgba(2,6,23,0.6)] text-center space-y-8 flex flex-col items-center justify-center cursor-pointer group"
          style={{
            transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.22s cubic-bezier(0.25, 1, 0.25, 1)'
          }}
        >
          {/* Laser flare sweep background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50 blur-2xl pointer-events-none" />
          
          {/* Decorative premium brass frame lines */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-500/20 rounded-tl-xl transition-all group-hover:border-amber-400 group-hover:scale-105" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-500/20 rounded-tr-xl transition-all group-hover:border-amber-400 group-hover:scale-105" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-500/20 rounded-bl-xl transition-all group-hover:border-amber-400 group-hover:scale-105" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-500/20 rounded-br-xl transition-all group-hover:border-amber-400 group-hover:scale-105" />

          {/* Cinematic Floating Logo */}
          <div className="relative p-2" style={{ transform: 'translateZ(40px)' }}>
            <div className="relative">
              <motion.img 
                src="https://i.postimg.cc/tTngPGq6/Chat-GPT-Image-8-de-jun-de-2026-15-18-21.png" 
                alt="JP Calçados Logo" 
                className="w-40 sm:w-48 h-auto object-contain mx-auto drop-shadow-[0_20px_50px_rgba(245,158,11,0.25)] transition-all group-hover:scale-103 group-hover:rotate-1 duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Shimmer lightning laser highlight */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full pointer-events-none filter blur-sm"
                animate={{
                  translateX: ['120%', '-120%']
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 1.8,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </div>
          </div>

          {/* Luxury display editorial headlines */}
          <div className="space-y-4 relative" style={{ transform: 'translateZ(30px)' }}>
            <motion.h2
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.45em" }}
              transition={{ delay: 0.4, duration: 1.2 }}
              className="font-serif italic text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-100 font-bold uppercase pl-[0.45em] drop-shadow-[0_2px_4px_rgba(2,6,23,0.3)]"
            >
              JP Calçados
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.8 }}
              className="text-[9px] uppercase font-black text-amber-405 tracking-[0.3em] pl-[0.3em] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> ALTA MODA • CONFORTO • ATACADO DIRETO
            </motion.div>
          </div>

          {/* Entering Button Trigger with Gold Reflection Glow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9 }}
            className="pt-2"
            style={{ transform: 'translateZ(25px)' }}
          >
            <button
              onClick={handleComplete}
              onMouseEnter={() => playLuxuryChime(false)}
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-[0.25em] pl-7 pr-6 py-4.5 rounded-full shadow-[0_15px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_25px_50px_rgba(245,158,11,0.4)] cursor-pointer transition-all duration-300 hover:scale-105 active:scale-97"
            >
              <span className="absolute inset-0 bg-white/20 rounded-full opacity-0 hover:opacity-100 transition-opacity blur-md" />
              Acessar Loja Premium
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
            </button>
          </motion.div>

        </motion.div>
      </div>

      {/* Cinematic status block in Footer */}
      <div className="w-full max-w-sm z-10 space-y-4">
        
        {/* Dynamic informative step titles */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-[9px] font-mono font-bold text-center text-slate-400 tracking-wider uppercase"
            >
              {stepsText[loadingStep] || 'Preenchendo experiência prime...'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Dynamic horizontal space-line progress loader */}
        <div className="relative w-full h-1 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
          />
        </div>

        {/* Dynamic secure standards seal footer */}
        <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest pt-1.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Criptografia SSL 256 bits
          </span>
          <span>JP COUTURE GROUP</span>
          <span className="flex items-center gap-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Servidor Prime
          </span>
        </div>
      </div>

    </div>
  );
}
