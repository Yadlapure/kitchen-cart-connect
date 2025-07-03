import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import FirstTimeAddressSetup from "@/components/FirstTimeAddressSetup";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with the current path as redirect parameter
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Protected Customer Routes */}
        <Route path="/orders" element={
          <ProtectedRoute>
            {user?.role === 'customer' ? <OrdersPage /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        <Route path="/orders/:orderId" element={
          <ProtectedRoute>
            {(user?.role === 'customer' || user?.role === 'merchant') ? <OrderDetailPage /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            {user?.role === 'customer' ? <ProfilePage /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        
        {/* Merchant Routes */}
        <Route path="/merchant/requests" element={
          <ProtectedRoute>
            {user?.role === 'merchant' ? <MerchantRequestsPage /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        <Route path="/merchant/orders" element={
          <ProtectedRoute>
            {user?.role === 'merchant' ? <MerchantOrdersPage /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        
        {/* Delivery Boy Routes */}
        <Route path="/delivery" element={
          <ProtectedRoute>
            {user?.role === 'delivery_boy' ? <DeliveryBoyPage /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        <Route path="/admin/merchants" element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute>
            {user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        } />
        
        {/* Catch-all Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* First Time Address Setup Modal */}
      <FirstTimeAddressSetup />
    </>
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
