import { create } from 'zustand';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type { Product, Category, CartItem, Order, Settings, Coupon } from '../types';

interface StoreState {
  // Splash
  hasSeenSplash: boolean;
  setHasSeenSplash: (val: boolean) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Admin / Data
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  settings: Settings;
  
  // Real-time synchronization initializer
  initRealTimeSync: () => () => void;

  // Actions
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;

  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

const defaultSettings: Settings = {
  storeName: 'JP Distribuidora de Calçados',
  whatsapp: '5531998251846',
  instagram: '@jp_distribuidora_ns',
  facebook: 'jpcalcados',
  tiktok: 'jpcalcados',
  email: 'jorgepancieridasilva@gmail.com',
  address: '📍 Nova Serrana – MG',
  businessHours: 'Seg à Sex: 08:00 - 18:00',
  wholesaleMinQty: 3,
};

// Seed initial products with retail + wholesale values
const initialProducts: Product[] = [
  {
    id: 'p1',
    name: 'Tênis Esportivo Pro Runner',
    description: 'Tênis de alta performance leve e confortável para corridas, treinos e uso diário com amortecimento inteligente.',
    sku: 'TEN-RUN-01',
    category: 'Esportivo',
    subcategory: 'Corrida',
    brand: 'Nike',
    price: 399.90,
    wholesalePrice: 299.90,
    promotionalPrice: 349.90,
    stock: 25,
    weight: 0.8,
    sizes: ['38', '39', '40', '41', '42'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mzl8MHwxfHNlYXJjaHwxfHxzaG9lc3xlbnwwfHx8fDE3MTUyNDIyMDd8MA&ixlib=rb-4.0.3&q=80&w=800'],
    createdAt: Date.now(),
    active: true,
  },
  {
    id: 'p2',
    name: 'Sapato Social Premium Elegance',
    description: 'Sapato social italiano confeccionado em couro nobre legítimo, perfeito para ambientes corporativos e eventos de gala.',
    sku: 'SAP-SOC-02',
    category: 'Masculino',
    subcategory: 'Social',
    brand: 'Zara',
    price: 250.00,
    wholesalePrice: 180.00,
    stock: 5,
    weight: 1.2,
    sizes: ['39', '40', '41', '42', '43'],
    images: ['https://images.unsplash.com/photo-1614252339474-af3ec4e3d368?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mzl8MHwxfHNlYXJjaHw3fHxzaG9lc3xlbnwwfHx8fDE3MTUyNDIyMDd8MA&ixlib=rb-4.0.3&q=80&w=800'],
    createdAt: Date.now(),
    active: true,
  },
  {
    id: 'p3',
    name: 'Tênis Casual Court Star',
    description: 'Design minimalista urbano de muita presença com solado antiderrapante vulcanizado e cabedal respirável.',
    sku: 'TEN-VOC-03',
    category: 'Feminino',
    subcategory: 'Casual',
    brand: 'Vans',
    price: 289.90,
    wholesalePrice: 210.00,
    stock: 12,
    weight: 0.9,
    sizes: ['34', '35', '36', '37', '38'],
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mzl8MHwxfHNlYXJjaHwzfHxzbmVha2Vyc3xlbnwwfHx8fDE3MTUyNDIyNjV8MA&ixlib=rb-4.0.3&q=80&w=800'],
    createdAt: Date.now(),
    active: true,
  },
  {
    id: 'p4',
    name: 'Chuteira de Campo Velocità',
    description: 'Chuteira de alto nível com travas estratégicas desenvolvida para aceleração rápida e controle de bola superior.',
    sku: 'CHU-CAM-04',
    category: 'Esportivo',
    subcategory: 'Futebol',
    brand: 'Puma',
    price: 320.00,
    wholesalePrice: 235.00,
    stock: 15,
    weight: 0.75,
    sizes: ['38', '39', '40', '41', '42', '43'],
    images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80'],
    createdAt: Date.now(),
    active: true,
  }
];

const initialCategories: Category[] = [
  { id: 'c1', name: 'Masculino', active: true, order: 1, subcategories: ['Casual', 'Social', 'Botas'] },
  { id: 'c2', name: 'Feminino', active: true, order: 2, subcategories: ['Saltos', 'Sapatilhas', 'Botas'] },
  { id: 'c3', name: 'Infantil', active: true, order: 3, subcategories: ['Menino', 'Menina'] },
  { id: 'c4', name: 'Esportivo', active: true, order: 4, subcategories: ['Corrida', 'Treino', 'Futebol'] },
];

export const useStore = create<StoreState>((set, get) => ({
  hasSeenSplash: false,
  setHasSeenSplash: (val) => set({ hasSeenSplash: val }),
  
  cart: [],
  addToCart: (item) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(i => i.id === item.id && i.selectedSize === item.selectedSize);
      if (existingItemIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingItemIndex].quantity += item.quantity;
        return { cart: newCart };
      }
      return { cart: [...state.cart, { ...item, cartItemId: Math.random().toString(36).substring(7) }] };
    });
  },
  removeFromCart: (cartItemId) => set((state) => ({ cart: state.cart.filter(i => i.cartItemId !== cartItemId) })),
  updateCartQuantity: (cartItemId, quantity) => set((state) => ({
    cart: state.cart.map(i => i.cartItemId === cartItemId ? { ...i, quantity: Math.max(1, quantity) } : i)
  })),
  clearCart: () => set({ cart: [] }),

  products: [],
  categories: [],
  orders: [],
  coupons: [],
  settings: defaultSettings,

  initRealTimeSync: () => {
    // 1. Listen to products online
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsList: Product[] = [];
      snapshot.forEach((doc) => {
        productsList.push(doc.data() as Product);
      });
      
      // Auto seed if completely empty
      if (productsList.length === 0) {
        initialProducts.forEach(async (p) => {
          try {
            await setDoc(doc(db, 'products', p.id), p);
          } catch (err) {
            console.error('Erro ao semear produto:', err);
          }
        });
      } else {
        set({ products: productsList });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    // 2. Listen to categories online
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesList: Category[] = [];
      snapshot.forEach((doc) => {
        categoriesList.push(doc.data() as Category);
      });

      // Auto seed if completely empty
      if (categoriesList.length === 0) {
        initialCategories.forEach(async (c) => {
          try {
            await setDoc(doc(db, 'categories', c.id), c);
          } catch (err) {
            console.error('Erro ao semear categoria:', err);
          }
        });
      } else {
        set({ categories: categoriesList.sort((a, b) => (a.order || 0) - (b.order || 0)) });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });

    // 3. Listen to orders online
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((doc) => {
        ordersList.push(doc.data() as Order);
      });
      set({ orders: ordersList.sort((a, b) => b.createdAt - a.createdAt) });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    // 4. Listen to settings online
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const currentData = docSnap.data() as Settings;
        if (
          currentData.whatsapp === '5511999999999' || 
          currentData.email === 'jp@x.com' || 
          currentData.address?.includes('Rua Principal')
        ) {
          const upgraded = { 
            ...currentData, 
            whatsapp: '5531998251846', 
            email: 'jorgepancieridasilva@gmail.com', 
            instagram: '@jp_distribuidora_ns', 
            address: '📍 Nova Serrana – MG' 
          };
          setDoc(doc(db, 'settings', 'general'), upgraded).catch((err) => {
            console.error('Erro ao atualizar configurações para novos dados:', err);
          });
          set({ settings: upgraded });
        } else {
          set({ settings: currentData });
        }
      } else {
        // Seed default parameters
        setDoc(doc(db, 'settings', 'general'), defaultSettings).catch((err) => {
          console.error('Erro ao semear configurações:', err);
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/general');
    });

    // 5. Listen to coupons online
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const couponsList: Coupon[] = [];
      snapshot.forEach((doc) => {
        couponsList.push(doc.data() as Coupon);
      });
      set({ coupons: couponsList.sort((a, b) => b.createdAt - a.createdAt) });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'coupons');
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubSettings();
      unsubCoupons();
    };
  },

  addProduct: async (p) => {
    try {
      await setDoc(doc(db, 'products', p.id), p);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${p.id}`);
    }
  },
  updateProduct: async (id, p) => {
    try {
      await updateDoc(doc(db, 'products', id), p);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  },
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  },

  addCategory: async (c) => {
    try {
      await setDoc(doc(db, 'categories', c.id), c);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `categories/${c.id}`);
    }
  },
  updateCategory: async (id, c) => {
    try {
      await updateDoc(doc(db, 'categories', id), c);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `categories/${id}`);
    }
  },
  deleteCategory: async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  },

  addCoupon: async (coupon) => {
    try {
      await setDoc(doc(db, 'coupons', coupon.id), coupon);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `coupons/${coupon.id}`);
    }
  },
  updateCoupon: async (id, coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', id), coupon);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `coupons/${id}`);
    }
  },
  deleteCoupon: async (id) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`);
    }
  },

  addOrder: async (o) => {
    try {
      await setDoc(doc(db, 'orders', o.id), o);
      // Automatically decrease stock on other synced clients
      for (const item of o.items) {
        const prod = get().products.find(p => p.id === item.id);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await updateDoc(doc(db, 'products', item.id), { stock: newStock });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${o.id}`);
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      const oldOrder = get().orders.find(ord => ord.id === id);
      if (!oldOrder) return;

      await updateDoc(doc(db, 'orders', id), { status });
      
      // Stock adjustment depending on status
      if (status === 'Cancelado' && oldOrder.status !== 'Cancelado') {
        for (const item of oldOrder.items) {
          const prod = get().products.find(p => p.id === item.id);
          if (prod) {
            await updateDoc(doc(db, 'products', item.id), { stock: prod.stock + item.quantity });
          }
        }
      } else if (oldOrder.status === 'Cancelado' && status !== 'Cancelado') {
        for (const item of oldOrder.items) {
          const prod = get().products.find(p => p.id === item.id);
          if (prod) {
            await updateDoc(doc(db, 'products', item.id), { stock: Math.max(0, prod.stock - item.quantity) });
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  },

  updateSettings: async (s) => {
    try {
      await setDoc(doc(db, 'settings', 'general'), { ...get().settings, ...s });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    }
  }
}));
