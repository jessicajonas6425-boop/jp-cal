import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../lib/utils';
import type { CartItem, Order, Product } from '../../types';
import { Search, Plus, Minus, Trash2, Printer, CreditCard, Banknote, QrCode } from 'lucide-react';

export default function PDV() {
  const { products, addOrder, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Pix' | 'Crédito' | 'Débito'>('Pix');
  const [customerName, setCustomerName] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const filteredProducts = products.filter(p => 
    p.active && 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const subtotal = cart.reduce((acc, item) => acc + ((item.promotionalPrice || item.price) * item.quantity), 0);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return alert('Sem estoque!');
    const existing = cart.find(i => i.id === product.id && i.selectedSize === product.sizes[0]);
    if (existing) {
      setCart(cart.map(i => i.cartItemId === existing.cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...product, cartItemId: Math.random().toString(), selectedSize: product.sizes[0], quantity: 1}]);
    }
    setSearchTerm('');
  };

  const handleFinish = () => {
    if (cart.length === 0) return;
    
    const order: Order = {
      id: 'PDV-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      customer: {
        fullName: customerName || 'Cliente Balcão',
        phone: '', email: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
        shippingOption: 'PAC', shippingCost: 0
      },
      items: cart,
      subtotal,
      shippingCost: 0,
      total: subtotal,
      status: 'Entregue', // PDV is instantly delivered
      createdAt: Date.now()
    };

    addOrder(order);
    setLastOrder(order);
    setCart([]);
    setCustomerName('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative">
      <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-6 print:hidden">Ponto de Venda (PDV)</h1>
      
      <div className="print:hidden flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        {/* Produto Selection (Esquerda) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200">
          <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
            <Search className="absolute left-7 top-7 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código de barras (SKU) ou Nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 focus:outline-none focus:border-indigo-500 rounded-lg text-lg uppercase shadow-sm"
              autoFocus
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredProducts.map(p => (
               <button 
                 key={p.id}
                 onClick={() => handleAddToCart(p)}
                 disabled={p.stock <= 0}
                 className={`flex flex-col border p-2 text-left h-48 group transition-colors ${p.stock <= 0 ? 'opacity-50 border-red-200 bg-red-50' : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50'}`}
               >
                 <div className="h-24 w-full bg-slate-100 mb-2 overflow-hidden relative">
                   <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                   {p.stock <= 0 && <span className="absolute inset-0 bg-white/60 flex items-center justify-center font-bold text-red-600 uppercase text-xs">Esgotado</span>}
                 </div>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider truncate">{p.sku}</p>
                 <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 mt-1">{p.name}</p>
                 <p className="text-sm font-black text-indigo-600 mt-auto">{formatCurrency(p.promotionalPrice || p.price)}</p>
               </button>
             ))}
          </div>
        </div>

        {/* Carrinho PDV (Direita) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900 text-white shadow-xl">
           <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
             <h2 className="text-lg font-bold uppercase tracking-widest text-slate-100">Caixa Aberto</h2>
             <span className="text-xs bg-green-500 text-white px-2 py-1 rounded font-bold uppercase">Online</span>
           </div>

           <div className="p-4 border-b border-slate-700">
             <input type="text" placeholder="Nome do Cliente (Opcional)" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border-none text-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
           </div>

           <div className="flex-1 overflow-y-auto p-2">
             {cart.map(item => (
               <div key={item.cartItemId} className="bg-slate-800 p-3 mb-2 flex gap-3 text-sm">
                 <div className="flex-1 flex flex-col justify-center">
                   <p className="font-bold text-slate-100 uppercase line-clamp-1">{item.name}</p>
                   <div className="flex justify-between mt-2">
                     <div className="flex gap-2">
                       <button onClick={() => setCart(cart.map(i => i.cartItemId === item.cartItemId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))} className="bg-slate-600 p-1 hover:bg-slate-500">-</button>
                       <span className="bg-slate-700 px-3 py-1 font-bold">{item.quantity}</span>
                       <button onClick={() => setCart(cart.map(i => i.cartItemId === item.cartItemId ? { ...i, quantity: i.quantity + 1 } : i))} className="bg-slate-600 p-1 hover:bg-slate-500">+</button>
                     </div>
                     <p className="font-bold">{formatCurrency((item.promotionalPrice || item.price) * item.quantity)}</p>
                   </div>
                 </div>
                 <button onClick={() => setCart(cart.filter(i => i.cartItemId !== item.cartItemId))} className="text-slate-400 hover:text-red-400 p-2">
                   <Trash2 className="w-5 h-5"/>
                 </button>
               </div>
             ))}
             {cart.length === 0 && <p className="text-center text-slate-500 mt-10 uppercase text-sm font-bold tracking-widest">Caixa Vazio</p>}
           </div>

           <div className="bg-slate-800 p-4 border-t border-slate-700">
             <div className="grid grid-cols-4 gap-2 mb-4">
               {['Pix', 'Dinheiro', 'Crédito', 'Débito'].map((method) => (
                 <button 
                   key={method}
                   onClick={() => setPaymentMethod(method as any)}
                   className={`flex flex-col items-center justify-center p-2 rounded transition-colors text-xs font-bold uppercase tracking-wider border ${paymentMethod === method ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                 >
                   {method === 'Pix' && <QrCode className="w-4 h-4 mb-1" />}
                   {method === 'Dinheiro' && <Banknote className="w-4 h-4 mb-1" />}
                   {(method === 'Crédito' || method === 'Débito') && <CreditCard className="w-4 h-4 mb-1" />}
                   {method}
                 </button>
               ))}
             </div>
             
             <div className="flex justify-between items-center mb-6 text-xl">
               <span className="font-medium text-slate-400 uppercase tracking-widest text-sm">Total a Pagar</span>
               <span className="font-black text-white text-3xl">{formatCurrency(subtotal)}</span>
             </div>

             <button 
               onClick={handleFinish}
               disabled={cart.length === 0}
               className="w-full bg-green-500 hover:bg-green-400 text-slate-900 font-black uppercase tracking-widest py-4 text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Finalizar Venda
             </button>
           </div>
        </div>
      </div>

      {/* Recibo para Impressão */}
      <div className="hidden print:block font-mono text-xs w-80 mx-auto">
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg uppercase">{settings.storeName}</h1>
          <p>{settings.address}</p>
          <p>Tel: {settings.whatsapp}</p>
          <p className="mt-2 border-b border-dashed border-black pb-2">RECIBO DE VENDA</p>
        </div>
        
        {lastOrder && (
          <>
            <p>Data: {new Date(lastOrder.createdAt).toLocaleString()}</p>
            <p>Pedido: #{lastOrder.id}</p>
            <p className="mb-2">Cliente: {lastOrder.customer.fullName}</p>
            
            <div className="border-t border-b border-dashed border-black py-2 mb-2">
              <div className="flex justify-between font-bold mb-1">
                <span>ITEM</span>
                <span>VLR</span>
              </div>
              {lastOrder.items.map(item => (
                <div key={item.cartItemId} className="flex justify-between">
                  <span className="truncate w-48">{item.quantity}x {item.name} ({item.selectedSize})</span>
                  <span>{formatCurrency((item.promotionalPrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between font-bold text-sm mb-4">
              <span>TOTAL:</span>
              <span>{formatCurrency(lastOrder.total)}</span>
            </div>
            
            <p className="text-center font-bold">Obrigado pela preferência!</p>
          </>
        )}
      </div>

      {/* Modal / Action after Finish */}
      {lastOrder && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 print:hidden">
           <div className="bg-white p-8 max-w-sm w-full shadow-2xl">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black uppercase text-center text-slate-900 mb-2">Venda Concluída!</h2>
              <p className="text-center text-slate-500 mb-8 font-medium">Troco: ----</p>
              
              <div className="space-y-3">
                <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold uppercase py-3 hover:bg-slate-800">
                  <Printer className="w-5 h-5"/> Imprimir Recibo
                </button>
                <button onClick={() => setLastOrder(null)} className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-bold uppercase py-3 hover:bg-slate-50">
                  Nova Venda
                </button>
              </div>
           </div>
         </div>
      )}
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
