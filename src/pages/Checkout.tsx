import React, { useState, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/utils';
import { ArrowLeft, Clock, ShoppingCart, Truck, CreditCard, Tag, X } from 'lucide-react';
import type { CheckoutForm, Order, Coupon } from '../types';

export default function Checkout() {
  const { cart, settings, coupons, addOrder, clearCart } = useStore();
  const navigate = useNavigate();
  const [loadingCep, setLoadingCep] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '', 
    phone: '', 
    email: '', 
    cep: '', 
    street: '', 
    number: '',
    complement: '', 
    neighborhood: '', 
    city: '', 
    state: '',
    shippingOption: 'PAC', 
    shippingCost: 0
  });

  // Calculate dynamic numbers based on Wholesale / Retail rules
  const totalItems = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  const minWholesaleQty = settings.wholesaleMinQty || 3;
  const isWholesale = totalItems >= minWholesaleQty;
  const buyMode = isWholesale ? 'Atacado' : 'Varejo';

  const { subtotal, savedAmount } = useMemo(() => {
    let sub = 0;
    let regularTotal = 0;

    cart.forEach(item => {
      const retailPrice = item.promotionalPrice || item.price;
      const wholesalePrice = item.wholesalePrice || (item.price * 0.8);
      
      regularTotal += retailPrice * item.quantity;
      sub += (isWholesale ? wholesalePrice : retailPrice) * item.quantity;
    });

    const saved = isWholesale ? Math.max(0, regularTotal - sub) : 0;
    return { subtotal: sub, savedAmount: saved };
  }, [cart, isWholesale]);

  const handleApplyCoupon = () => {
    setCouponError('');
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;
    
    const coupon = coupons.find(c => c.id === cleanCode);
    if (!coupon) {
      setCouponError('Cupom inválido ou não encontrado.');
      setAppliedCoupon(null);
      return;
    }
    if (!coupon.active) {
      setCouponError('Este cupom não está mais ativo.');
      setAppliedCoupon(null);
      return;
    }
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      setCouponError(`Este cupom exige um pedido mínimo de ${formatCurrency(coupon.minOrderValue)}.`);
      setAppliedCoupon(null);
      return;
    }
    
    setAppliedCoupon(coupon);
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'porcentagem') {
      return (subtotal * appliedCoupon.value) / 100;
    } else {
      return Math.min(subtotal, appliedCoupon.value);
    }
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + form.shippingCost - discountAmount);
  }, [subtotal, form.shippingCost, discountAmount]);

  if (cart.length === 0) {
    navigate('/carrinho');
    return null;
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    setForm(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
            // Simulate postal delivery rates based on distance/state
            shippingCost: data.uf === 'SP' ? 14.90 : 29.90
          }));
        }
      } catch (err) {
        console.error('Error fetching CEP:', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleShippingChange = (option: 'PAC' | 'SEDEX') => {
    setForm(prev => {
      const baseCost = prev.state === 'SP' ? 14.90 : 29.90;
      const newCost = option === 'SEDEX' ? baseCost + 15.00 : baseCost;
      return {
        ...prev,
        shippingOption: option,
        shippingCost: newCost
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!form.shippingCost) {
      alert('Por favor, informe seu CEP para calcularmos as opções de frete disponíveis.');
      return;
    }

    const order: Order = {
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      customer: form,
      items: [...cart],
      subtotal,
      shippingCost: form.shippingCost,
      total,
      status: 'Pendente',
      createdAt: Date.now(),
      mode: buyMode,
      totalItems,
      savedAmount
    };

    addOrder(order);
    
    // FORMATTED WHATSAPP LINK GENERATOR (Specification Goal)
    const whatsAppMessage = `👟 *JP CALÇADOS - NOVO PEDIDO PARA ENTREGA*
=========================================
🏷️ *PEDIDO:* #${order.id}
📅 *DATA:* ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

👤 *DADOS DO CLIENTE:*
• Nome: ${form.fullName}
• WhatsApp: ${form.phone}
• E-mail: ${form.email}

📍 *ENDEREÇO DE ENTREGA:*
• CEP: ${form.cep}
• Rua: ${form.street}, Nº ${form.number}
• Complemento: ${form.complement || 'N/A'}
• Bairro: ${form.neighborhood}
• Cidade/Estado: ${form.city} - ${form.state}

=========================================
📦 *ITENS DO PEDIDO:*
${cart.map(item => {
  const priceUsed = isWholesale ? item.wholesalePrice : (item.promotionalPrice || item.price);
  return `• ${item.name}
  - Tam: ${item.selectedSize} | Qtd: ${item.quantity} un
  - Preço Unit: ${formatCurrency(priceUsed)}
  - Subtotal: ${formatCurrency(priceUsed * item.quantity)}
`;
}).join('\n')}
=========================================
⚠️ *RESUMO DO MODELO DE COMPRA:*
• Tipo de Compra: *${buyMode.toUpperCase()}*
• Total de Pares: *${totalItems}*
• Valor Economizado: *${formatCurrency(savedAmount)}*

💰 *FINANCEIRO:*
• Subtotal Itens: ${formatCurrency(subtotal)}
• Frete (${form.shippingOption}): ${formatCurrency(form.shippingCost)}
${appliedCoupon ? `• Cupom Desconto (${appliedCoupon.id}): -${formatCurrency(discountAmount)}\n` : ''}• *Total Geral: ${formatCurrency(total)}*
=========================================
⚡ _Obrigado por comprar conosco! Nosso despachante responderá na sequência com a confirmação de empacotamento e código Pix._`;

    clearCart();
    
    const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(whatsAppMessage)}`;
    
    // Smooth navigation fallback safely running on standard tab handlers
    window.open(whatsappUrl, '_blank');
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24 bg-slate-50/20">
      
      {/* Upper links */}
      <button 
        onClick={() => navigate('/carrinho')}
        className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest mb-8 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Carrinho
      </button>

      <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-900 mb-2">
        Finalizar no WhatsApp
      </h1>
      <p className="text-slate-500 text-sm mb-12">
        Insira suas coordenadas e dados de contato. Enviaremos o espelho de compras formatado para o WhatsApp da JP Calçados com as marcações corretas.
      </p>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Form Inputs columns */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Personal detail card */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
            <h2 className="text-sm font-black uppercase text-slate-850 tracking-widest border-b border-slate-100 pb-4 mb-6">
              1. Identificação do Comprador
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                <input 
                  required 
                  type="text" 
                  value={form.fullName} 
                  onChange={e => setForm({...form, fullName: e.target.value})} 
                  placeholder="Seu nome e sobrenome"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">E-mail</label>
                <input 
                  required 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Telefone (Com WhatsApp)</label>
                <input 
                  required 
                  type="tel" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="(11) 99999-9999"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>
            </div>
          </section>

          {/* Delivery Coordinates card */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-black uppercase text-slate-850 tracking-widest border-b border-slate-100 pb-4 mb-6">
              2. Endereço de Despacho
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">CEP (Consulte viaCEP)</label>
                <div className="relative">
                  <input 
                    required 
                    type="text" 
                    maxLength={9} 
                    value={form.cep} 
                    onChange={handleCepChange} 
                    placeholder="00000-000"
                    className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none font-mono transition-all font-bold" 
                  />
                  {loadingCep && (
                    <span className="absolute right-3.5 top-3.5 text-[9px] font-black text-indigo-650 bg-indigo-50 border border-indigo-150 rounded px-1.5 py-0.5 animate-pulse">
                      Consultando...
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Rua / Logradouro</label>
                <input 
                  required 
                  type="text" 
                  value={form.street} 
                  onChange={e => setForm({...form, street: e.target.value})} 
                  placeholder="Ex: Avenida Paulista"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Número</label>
                <input 
                  required 
                  type="text" 
                  value={form.number} 
                  onChange={e => setForm({...form, number: e.target.value})} 
                  placeholder="123"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Logradouro / Complemento</label>
                <input 
                  type="text" 
                  value={form.complement} 
                  onChange={e => setForm({...form, complement: e.target.value})} 
                  placeholder="Apartamento, Bloco, etc. (Opcional)"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bairro</label>
                <input 
                  required 
                  type="text" 
                  value={form.neighborhood} 
                  onChange={e => setForm({...form, neighborhood: e.target.value})} 
                  placeholder="Ex: Centro"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cidade</label>
                <input 
                  required 
                  type="text" 
                  value={form.city} 
                  onChange={e => setForm({...form, city: e.target.value})} 
                  placeholder="Ex: São Paulo"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none transition-all font-bold" 
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">UF</label>
                <input 
                  required 
                  type="text" 
                  maxLength={2} 
                  value={form.state} 
                  onChange={e => setForm({...form, state: e.target.value})} 
                  placeholder="SP"
                  className="w-full bg-slate-50 border-2 border-slate-205 focus:border-indigo-500 focus:bg-white text-sm p-3 rounded-lg outline-none text-center uppercase transition-all font-bold" 
                />
              </div>
            </div>
          </section>

          {/* Delivery choices */}
          {form.shippingCost > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-sm font-black uppercase text-slate-850 tracking-widest border-b border-slate-100 pb-4 mb-6">
                3. Agendamento de Entrega
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label 
                  onClick={() => handleShippingChange('PAC')}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    form.shippingOption === 'PAC' ? 'border-indigo-550 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="PAC"
                      checked={form.shippingOption === 'PAC'} 
                      onChange={() => handleShippingChange('PAC')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-550" 
                    />
                    <div>
                      <p className="font-extrabold uppercase text-xs text-slate-800">PAC - Econômico</p>
                      <p className="text-[10px] text-slate-450 font-medium">Prazo estimado: 5 a 10 dias</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-slate-800">{formatCurrency(form.state === 'SP' ? 14.90 : 29.90)}</span>
                </label>
                
                <label 
                  onClick={() => handleShippingChange('SEDEX')}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    form.shippingOption === 'SEDEX' ? 'border-indigo-550 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="shipping" 
                      value="SEDEX"
                      checked={form.shippingOption === 'SEDEX'} 
                      onChange={() => handleShippingChange('SEDEX')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-550" 
                    />
                    <div>
                      <p className="font-extrabold uppercase text-xs text-slate-800">SEDEX - Expresso</p>
                      <p className="text-[10px] text-slate-450 font-medium">Prazo estimado: 1 a 3 dias</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-slate-800">{formatCurrency((form.state === 'SP' ? 14.90 : 29.90) + 15.00)}</span>
                </label>
              </div>
            </section>
          )}
        </div>

        {/* Order review sticky ticket Right Column */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-850 p-6 sm:p-8 shadow-xl sticky top-24 space-y-6">
            
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-800 pb-4">
              Resumo e Conferência
            </h2>
            
            {/* Items list review */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin divide-y divide-slate-800/60">
              {cart.map(item => {
                const itemPrice = isWholesale ? item.wholesalePrice : (item.promotionalPrice || item.price);
                return (
                  <div key={item.cartItemId} className="flex gap-3 text-xs pt-3 first:pt-0">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                       <img src={item.images[0]} alt="" className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-200 leading-tight uppercase truncate">{item.name}</p>
                      <p className="text-slate-450 text-[10px] mt-0.5 font-semibold">Tamanho: {item.selectedSize} | Qtd: {item.quantity}</p>
                      <p className="font-extrabold text-teal-400 mt-1">{formatCurrency(itemPrice * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wholesale mode overview tag */}
            <div className="p-3 bg-slate-800 border border-slate-700/80 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Modo de Faturamento:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  isWholesale ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {buyMode}
                </span>
              </div>
              {isWholesale && savedAmount > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-700/40 text-[11px] font-extrabold text-emerald-400">
                  <span>Desconto Lote de Fábrica:</span>
                  <span>-{formatCurrency(savedAmount)}</span>
                </div>
              )}
            </div>

            {/* Cupom application panel */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Cupom de Desconto</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="EX: JP10"
                  className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs p-2.5 rounded-xl font-bold uppercase tracking-wider outline-none focus:border-indigo-500" 
                />
                <button 
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold uppercase text-[10px] px-4 rounded-xl transition-all cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
              {couponError && <p className="text-[10px] text-rose-400 font-extrabold pl-1">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-black text-[10px] tracking-wider uppercase truncate">Cupom {appliedCoupon.id} aplicado!</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remover Cupom"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Calculations lines */}
            <div className="border-t border-slate-800 pt-4 space-y-3 font-semibold text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <span>Subtotal Calçados</span>
                <span className="text-white font-extrabold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Taxa de Frete ({form.shippingOption})</span>
                <span className="text-white font-extrabold">{form.shippingCost ? formatCurrency(form.shippingCost) : 'Informar CEP'}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-400 font-extrabold">
                  <span>Desconto ({appliedCoupon.id})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>
            
            {/* Total final */}
            <div className="border-t border-slate-800 pt-4 flex justify-between items-end">
              <div>
                <span className="font-black uppercase tracking-wider text-[10px] text-slate-450 block mb-0.5">Total para Transferência</span>
                <span className="text-[10px] text-slate-550">({totalItems} pares de calçados)</span>
              </div>
              <span className={`text-2xl font-black ${isWholesale ? 'text-emerald-450' : 'text-white'}`}>
                {formatCurrency(total)}
              </span>
            </div>
            
            <button 
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              FINALIZAR PEDIDO
            </button>
            
            <p className="text-[10px] text-center text-slate-500 leading-relaxed font-bold uppercase tracking-wide">
              🔒 Seu pedido será consolidado e enviado diretamente ao despachante autorizado.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
