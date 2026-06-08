import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import { Eye, ChevronDown, ChevronUp, ShoppingBag, Truck } from 'lucide-react';
import type { Order } from '../../types';

export default function Orders() {
  const { orders, updateOrderStatus } = useStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: Order['status']) => {
    updateOrderStatus(id, status);
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-905">
          Gestão de Pedidos
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Acompanhe faturamentos, emita códigos de rastreamento, altere status de lote e confira itens de atacado e varejo.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 font-black">
                <th className="p-4 pl-6">ID Pedido / Data</th>
                <th className="p-4">Cliente / Região</th>
                <th className="p-4">Segmento</th>
                <th className="p-4 text-center">Itens Totais</th>
                <th className="p-4">Economia</th>
                <th className="p-4">Financeiro</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Ação</th>
                <th className="p-4 pr-6 text-right">Itens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => {
                const isExpanded = expandedOrderId === order.id;
                const dateString = new Date(order.createdAt).toLocaleDateString('pt-BR');
                const timeString = new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <span className="font-black text-slate-900 block font-mono">#{order.id}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{dateString} às {timeString}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block text-sm leading-none">{order.customer.fullName}</span>
                        <span className="text-[10px] text-slate-500 block mt-1">{order.customer.city} - {order.customer.state}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                          order.mode === 'Atacado' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-150'
                        }`}>
                          {order.mode || 'Varejo'}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">
                        {order.totalItems || order.items.reduce((a, b) => a + b.quantity, 0)} pares
                      </td>
                      <td className="p-4 font-black text-emerald-600">
                        {order.savedAmount ? formatCurrency(order.savedAmount) : formatCurrency(0)}
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 block">{formatCurrency(order.total)}</span>
                        <span className="text-[9px] text-slate-450 block">Frete: {formatCurrency(order.shippingCost)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border
                            ${order.status === 'Pendente' ? 'bg-yellow-50 text-yellow-750 border-yellow-150 animate-pulse' : ''}
                            ${order.status === 'Aprovado' ? 'bg-blue-50 text-blue-750 border-blue-150' : ''}
                            ${order.status === 'Enviado' ? 'bg-indigo-50 text-indigo-705 border-indigo-150' : ''}
                            ${order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-755 border-emerald-150' : ''}
                            ${order.status === 'Cancelado' ? 'bg-rose-50 text-rose-750 border-rose-150' : ''}
                          `}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                          className="border border-slate-250 text-xs font-black uppercase p-2 rounded bg-white cursor-pointer outline-none focus:border-indigo-500"
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregue">Entregue</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => toggleExpandOrder(order.id)}
                          className={`p-2.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center justify-center`}
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Collapsible expansion space for order items details listed cleanly */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="bg-slate-50/50 p-6 border-b border-slate-205">
                          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-inner max-w-4xl">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-450 flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4 text-slate-500" /> Detalhamento do Lote de Calçados
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {order.items.map((item, idx) => {
                                const appliedPrice = order.mode === 'Atacado' ? (item.wholesalePrice || item.price * 0.8) : (item.promotionalPrice || item.price);
                                return (
                                  <div key={idx} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-2 /20 shadow-xs">
                                    <img src={item.images[0]} alt="" className="w-12 h-12 object-cover rounded border border-slate-200 shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-extrabold text-xs text-slate-800 truncate uppercase">{item.name}</p>
                                      <p className="text-[10px] text-slate-450 font-bold mt-1">TAM: {item.selectedSize} | QUANT: {item.quantity} pares</p>
                                      <p className="text-xs font-extrabold text-slate-800 mt-1">
                                        Sub: {formatCurrency(appliedPrice * item.quantity)} <span className="text-[10px] text-slate-400 font-normal">({formatCurrency(appliedPrice)} un)</span>
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Shipping details and customer coordinates review */}
                            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-650">
                              <div>
                                <span className="font-black text-slate-500 uppercase tracking-widest text-[10px] block mb-2">Ficha de Endereçamento</span>
                                <p><span className="font-bold text-slate-800">Destinatário:</span> {order.customer.fullName}</p>
                                <p><span className="font-bold text-slate-800">Telefone:</span> {order.customer.phone}</p>
                                <p><span className="font-bold text-slate-800">Endereço:</span> {order.customer.street}, {order.customer.number} {order.customer.complement && `• Compl: ${order.customer.complement}`}</p>
                                <p><span className="font-bold text-slate-800">Bairro:</span> {order.customer.neighborhood} | {order.customer.city} - {order.customer.state}</p>
                                <p><span className="font-bold text-slate-805">CEP:</span> {order.customer.cep}</p>
                              </div>
                              <div>
                                <span className="font-black text-slate-500 uppercase tracking-widest text-[10px] block mb-2">Informações Adicionais</span>
                                <p><span className="font-bold text-slate-800">Opção de Envio:</span> {order.customer.shippingOption} (Correios)</p>
                                <p><span className="font-bold text-slate-800">Forma de Despacho:</span> WhatsApp Sync</p>
                                <div className="mt-4 inline-flex items-center gap-1.5 text-slate-550 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                                  <Truck className="w-4 h-4 text-slate-450" /> {order.status === 'Enviado' ? 'Código emitido pela agência' : 'Aguardando faturamento'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-slate-450 font-bold">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    Nenhum pedido de Calçado cadastrado no sistema ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
