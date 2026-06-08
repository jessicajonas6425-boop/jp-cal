/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Layouts
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Coupons from './pages/admin/Coupons';
import Orders from './pages/admin/Orders';
import PDV from './pages/admin/PDV';
import Settings from './pages/admin/Settings';
import Atacado from './pages/admin/Atacado';

export default function App() {
  const { hasSeenSplash, initRealTimeSync } = useStore();

  useEffect(() => {
    const unsub = initRealTimeSync();
    return () => {
      unsub();
    };
  }, [initRealTimeSync]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen */}
        <Route path="/splash" element={<Splash />} />

        {/* Public Storefront */}
        <Route path="/" element={hasSeenSplash ? <UserLayout /> : <Navigate to="/splash" replace />}>
          <Route index element={<Home />} />
          <Route path="categoria/:slug" element={<Home />} />
          <Route path="promocoes" element={<Home />} />
          <Route path="produto/:id" element={<Product />} />
          <Route path="carrinho" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Backoffice */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<Products />} />
          <Route path="categorias" element={<Categories />} />
          <Route path="cupons" element={<Coupons />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="pdv" element={<PDV />} />
          <Route path="atacado" element={<Atacado />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthed = localStorage.getItem('isAdminAuthed') === 'true';
  if (!isAuthed) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
