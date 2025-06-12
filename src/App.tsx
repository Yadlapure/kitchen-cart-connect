
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginScreen from "@/components/LoginScreen";

// Pages
import Index from "./pages/Index";
import RequestPage from "./pages/RequestPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import MerchantRequestsPage from "./pages/MerchantRequestsPage";
import MerchantOrdersPage from "./pages/MerchantOrdersPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      {/* Customer Routes */}
      {user.role === 'customer' && (
        <>
          <Route path="/" element={<Index />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </>
      )}
      
      {/* Merchant Routes */}
      {user.role === 'merchant' && (
        <>
          <Route path="/" element={<MerchantRequestsPage />} />
          <Route path="/merchant/requests" element={<MerchantRequestsPage />} />
          <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </>
      )}
      
      {/* Admin Routes */}
      {user.role === 'admin' && (
        <>
          <Route path="/" element={<AdminDashboard />} />
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
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
