
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/redux';
import LoginScreen from "@/components/LoginScreen";

// Pages
import Index from "./pages/Index";
import RequestPage from "./pages/RequestPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MerchantRequestsPage from "./pages/MerchantRequestsPage";
import MerchantOrdersPage from "./pages/MerchantOrdersPage";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryBoyPage from "./pages/DeliveryBoyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Only require login for non-customer routes
  if (!user && window.location.pathname !== '/' && window.location.pathname !== '/request') {
    return <LoginScreen />;
  }

  return (
    <Routes>
      {/* Public Customer Routes (no authentication required) */}
      <Route path="/" element={<Index />} />
      <Route path="/request" element={<RequestPage />} />
      
      {/* Protected Customer Routes */}
      {user?.role === 'customer' && (
        <>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </>
      )}
      
      {/* Merchant Routes */}
      {user?.role === 'merchant' && (
        <>
          <Route path="/merchant/requests" element={<MerchantRequestsPage />} />
          <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </>
      )}
      
      {/* Delivery Boy Routes */}
      {user?.role === 'delivery_boy' && (
        <>
          <Route path="/delivery" element={<DeliveryBoyPage />} />
        </>
      )}
      
      {/* Admin Routes */}
      {user?.role === 'admin' && (
        <>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/merchants" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminDashboard />} />
        </>
      )}
      
      {/* Catch-all Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </Provider>
  </QueryClientProvider>
);

export default App;
