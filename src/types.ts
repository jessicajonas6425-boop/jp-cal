export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number; // Preço Varejo
  wholesalePrice: number; // Preço Atacado
  promotionalPrice?: number;
  stock: number;
  weight: number;
  sizes: string[];
  colors?: string[];
  images: string[];
  createdAt: number;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
  order: number;
  subcategories: string[];
}

export interface CartItem extends Product {
  cartItemId: string;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}

export interface CheckoutForm {
  fullName: string;
  phone: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  shippingOption: 'PAC' | 'SEDEX';
  shippingCost: number;
}

export interface Order {
  id: string;
  customer: CheckoutForm;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'Pendente' | 'Aprovado' | 'Enviado' | 'Entregue' | 'Cancelado';
  createdAt: number;
  mode?: 'Varejo' | 'Atacado';
  totalItems?: number;
  savedAmount?: number;
}

export interface Settings {
  storeName: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  email: string;
  address: string;
  businessHours: string;
  wholesaleMinQty: number; // Quantidade mínima para atacado
  heroBgUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

export interface Coupon {
  id: string; // O código do cupom, ex: "BEMVINDO10" (sempre em uppercase)
  type: 'porcentagem' | 'valor'; // porcentagem ou valor fixo
  value: number; // ex: 10 para 10% ou 15 para R$ 15,00
  minOrderValue?: number; // valor mínimo opcional do carrinho para aplicar o cupom
  active: boolean;
  createdAt: number;
}

