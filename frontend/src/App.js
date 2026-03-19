import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import WhatsAppChatButton from "./components/whatsapp/WhatsAppButton";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConsultationPage from "./pages/ConsultationPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import DashboardPage from "./pages/DashboardPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

// Router component to handle auth callback detection
function AppRouter() {
  const location = useLocation();

  // Handle Favicon from site config
  React.useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) return;

    const updateFavicon = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/site-config`);
        if (res.ok) {
          const config = await res.json();
          if (config.favicon_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = config.favicon_url;
          }
        }
      } catch (err) {
        console.warn('Favicon update failed:', err);
      }
    };
    updateFavicon();
  }, []);
  
  // Check URL fragment (not query params) for session_id synchronously
  // This prevents race conditions by detecting auth callback FIRST
  if (location.hash?.includes('session_id=')) {
    return <AuthCallbackPage />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/prescriptions" element={<DashboardPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          
          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
      {/* Global WhatsApp Chat Button */}
      <WhatsAppChatButton />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
