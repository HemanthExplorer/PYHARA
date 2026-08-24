import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import ProductDetailModal from './components/ProductDetailModal';
import CustomerAuthModal from './components/CustomerAuthModal';
import Toast from './components/Toast';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTracking from './pages/OrderTracking';
import Account from './pages/Account';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import RefundPolicy from './pages/RefundPolicy';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminLocations from './pages/AdminLocations';

export default function App() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderConfirmation />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/refunds" element={<RefundPolicy />} />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <AdminProducts />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrders />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/locations"
            element={
              <ProtectedAdminRoute>
                <AdminLocations />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals & Notifications */}
      <CustomerAuthModal />
      <CartDrawer />
      <SearchModal />
      <ProductDetailModal />
      <Toast />
    </div>
  );
}
