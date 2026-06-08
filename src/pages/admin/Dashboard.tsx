import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Layers, 
  Tag, 
  Award, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  TrendingUp as TrendIcon
} from 'lucide-react';

export default function Dashboard() {
  const { products, orders } = useStore();

  // Computations for wholesale vs retail (Specification Requirements)
  const stats = useMemo(() => {
    let salesTotal = 0;
    let wholesaleOrdersCount = 0;
    let retailOrdersCount = 0;
    let wholesaleBilling = 0;
    let retailBilling = 0;
    let totalSaved = 0;
    let totalPairsSold = 0;

    orders.forEach(order => {
      salesTotal += order.total;
      totalSaved += order.savedAmount || 0;
      
      const isAtacado = order.mode === 'Atacado';
      const itemsInOrder = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
      totalPairsSold += itemsInOrder;

      if (isAtacado) {
        wholesaleOrdersCount += 1;
        wholesaleBilling += order.total;
      } else {
        retailOrdersCount += 1;
        retailBilling += order.total;
      }
    });

    const productsOutOfStock = products.filter(p => p.stock <= 0).length;
    const productsLowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

    return {
      salesTotal,
      wholesaleOrdersCount,
      retailOrdersCount,
      wholesaleBilling,
      retailBilling,
      totalSaved,
      totalPairsSold,
      productsOutOfStock,
      productsLowStock,
    };
  }, [orders, products]);

  // Compute most popular products in Wholesale vs Retail (Specification Requirements)
  const popularInWholesale = useMemo(() => {
    const map: Record<string, { id: string; name: string; sku: string; brand: string; qty: number; image: string }> = {};
    
    orders.filter(o => o.mode === 'Atacado').forEach(o => {
      o.items.forEach(itm => {
        if (!map[itm.id]) {
          map[itm.id] = { id: itm.id, name: itm.name, sku: itm.sku, brand: itm.brand, qty: 0, image: itm.images[0] };
        }
        map[itm.id].qty += itm.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const popularInRetail = useMemo(() => {
    const map: Record<string, { id: string; name: string; sku: string; brand: string; qty: number; image: string }> = {};
    
    orders.filter(o => o.mode === 'Varejo' || !o.mode).forEach(o => {
      o.items.forEach(itm => {
        if (!map[itm.id]) {
          map[itm.id] = { id: itm.id, name: itm.name, sku: itm.sku, brand: itm.brand, qty: 0, image: itm.images[0] };
        }
        map[itm.id].qty += itm.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-10">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-905">
            Métricas de Faturamento
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visão Geral analítica segmentada de atacado, varejo, vendas acumuladas e saúde de estoque JP Calçados.
          </p>
        </div>
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-100 hover:bg-slate-200/60 px-4 py-2.5 rounded-lg select-none">
          Live Sync • Firebase Real-Time ativo
        </div>
      </div>

      {/* Main Stats Segmented Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Billing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250/70 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Faturamento Geral</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.salesTotal)}</p>
          </div>
        </div>

        {/* Total Wholesale Billing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250/70 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 animate-pulse">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest leading-none mb-1">Receita Atacado</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.wholesaleBilling)}</p>
          </div>
        </div>

        {/* Total Retail Billing */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250/70 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-teal-50 text-teal-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Receita Varejo</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.retailBilling)}</p>
          </div>
        </div>

        {/* Total Economy (Amount Saved) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-250/70 shadow-sm flex items-center gap-4">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] b-1 text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Economia de Clientes</p>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(stats.totalSaved)}</p>
          </div>
        </div>
      </div>

      {/* WHATSAPP SPECIFICATION SPLITS (Wholesale vs Retail Orders count) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-radial-gradient/10 pointer-events-none" />
        
        <div className="space-y-4">
          <span className="text-[9px] bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-black tracking-widest uppercase px-3 py-1 rounded-full">
            Segmentação de Lotes
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight">Cargas de Pedidos</h2>
          <p className="text-slate-450 text-xs leading-relaxed">
            Monitoramento de quotas em tempo real baseado nas regras de quantitativo mínimo configuradas para a JP Distribuidora de Calçados.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800 border border-slate-700/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Atacado ({stats.wholesaleOrdersCount})
            </div>
            <p className="text-2xl font-black">{stats.wholesaleOrdersCount} lotes</p>
            <span className="text-[10px] text-slate-450 block">Partindo da cota de pares mínima</span>
          </div>

          <div className="p-4 bg-slate-800 border border-slate-700/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-rose-450 font-bold uppercase tracking-wider">
              <Tag className="w-4 h-4" /> Varejo ({stats.retailOrdersCount})
            </div>
            <p className="text-2xl font-black">{stats.retailOrdersCount} pares</p>
            <span className="text-[10px] text-slate-450 block">Descontos unitários padrão</span>
          </div>
        </div>
      </div>

      {/* Top Sellers segment maps (Specification Goal) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Wholesales top sellers */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black uppercase text-sm text-slate-800">Mais Vendidos no Atacado</h3>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Atacado</span>
          </div>

          <div className="space-y-4">
            {popularInWholesale.map((p, idx) => (
              <div key={p.id} className="flex gap-4 items-center p-3 bg-slate-50 border border-slate-150/60 rounded-xl hover:bg-slate-100/40 transition-colors">
                <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-slate-800 truncate uppercase leading-none">{p.name}</p>
                  <p className="text-[10px] text-slate-450 font-mono mt-1">SKU: {p.sku} | {p.brand}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2.5 py-1 rounded-full">
                    {p.qty} un
                  </span>
                </div>
              </div>
            ))}

            {popularInWholesale.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-8 font-bold">Nenhum calçado comprado sob preço de atacado.</p>
            )}
          </div>
        </div>

        {/* Retail top sellers */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black uppercase text-sm text-slate-800">Mais Vendidos no Varejo</h3>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">Varejo</span>
          </div>

          <div className="space-y-4">
            {popularInRetail.map((p, idx) => (
              <div key={p.id} className="flex gap-4 items-center p-3 bg-slate-50 border border-slate-150/60 rounded-xl hover:bg-slate-100/40 transition-colors">
                <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-slate-800 truncate uppercase leading-none">{p.name}</p>
                  <p className="text-[10px] text-slate-450 font-mono mt-1">SKU: {p.sku} | {p.brand}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-2.5 py-1 rounded-full">
                    {p.qty} un
                  </span>
                </div>
              </div>
            ))}

            {popularInRetail.length === 0 && (
              <p className="text-slate-405 text-xs text-center py-8 font-bold">Nenhum calçado comprado em varejo ainda.</p>
            )}
          </div>
        </div>

      </div>

      {/* Orders flow and alerts summary block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Latest overall orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-black uppercase text-sm text-slate-850">Resumos Recentes</h3>
            <Link to="/admin/pedidos" className="text-xs font-black uppercase tracking-wider text-indigo-600 hover:underline flex items-center gap-1">
              Todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-3.5 border border-slate-150 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-sm text-slate-900">Pedido #{order.id}</p>
                    <span className={`text-[8px] font-black uppercase border px-1.5 py-0.5 rounded ${
                      order.mode === 'Atacado' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {order.mode || 'Varejo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    {order.customer.fullName} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800 text-sm">{formatCurrency(order.total)}</p>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    order.status === 'Entregue' ? 'bg-green-50 text-green-700 border border-green-100' :
                    order.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border border-yellow-105' :
                    'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && (
              <p className="text-slate-450 text-xs text-center py-8">Nenhum faturamento registrado.</p>
            )}
          </div>
        </div>

        {/* Low stocks panel with warnings alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-black uppercase text-sm text-slate-850">Estoque Crítico (Abaixo de 5 un)</h3>
            <span className="text-[10px] font-bold text-slate-410 bg-slate-50 px-2 py-0.5 rounded uppercase">Controle de Calhas</span>
          </div>

          <div className="space-y-4">
            {products.filter(p => p.stock <= 5).slice(0, 5).map(p => (
              <div key={p.id} className="flex gap-4 items-center p-3 border border-red-100 bg-red-50/20 rounded-xl hover:bg-rose-50/40 transition-colors">
                <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-slate-800 truncate uppercase leading-none">{p.name}</p>
                  <p className="text-[10px] text-slate-450 font-mono mt-1">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${
                    p.stock === 0 ? 'bg-red-200 text-red-900 border border-red-300' : 'bg-amber-100 text-amber-900 border border-amber-250'
                  }`}>
                    {p.stock === 0 ? 'Esgotado' : `${p.stock} un`}
                  </span>
                </div>
              </div>
            ))}
            
            {products.filter(p => p.stock <= 5).length === 0 && (
              <p className="text-emerald-600/85 text-xs text-center py-8 font-extrabold">✓ Ótimo! Todos os produtos com estoque saudável.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
