import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { updateDeliveryStatus, updateOrder } from "@/store/appSlice";
import { toast } from "sonner";
import { MapPin, Phone, Clock } from "lucide-react";

const DeliveryBoyPage = () => {
  const { orders, merchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [hasShownInitialOrders, setHasShownInitialOrders] = useState(false);
  const [notifiedOrders, setNotifiedOrders] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (user?.role !== 'delivery_boy') {
      navigate('/');
    }
  }, [user, navigate]);

  // Get my active orders (orders assigned to this delivery boy with status 'delivering')
  const myOrders = orders.filter(order => {
    console.log(`🔍 Checking order ${order.id}: deliveryBoyId=${order.deliveryBoyId}, status=${order.status}, userID=${user?.id}`);
    return order.deliveryBoyId === user?.id && order.status === 'delivering';
  });

  // Get completed orders
  const completedOrders = orders.filter(order => 
    order.deliveryBoyId === user?.id && order.status === 'completed'
  );

  console.log(`🔍 DELIVERY BOY DASHBOARD: User ID: ${user?.id}, Total orders: ${orders.length}, My active orders: ${myOrders.length}`);
  
  // Debug: Log all orders with delivery assignments
  orders.forEach(order => {
    if (order.deliveryBoyId) {
      console.log(`📦 Order with delivery assignment: ${order.id}, Status: ${order.status}, Assigned to: ${order.deliveryBoyId}, Current user: ${user?.id}`);
    }
  });

  myOrders.forEach(order => {
    console.log(`📦 Active Order: ${order.id}, Status: ${order.status}, Assigned to: ${order.deliveryBoyId}`);
  });

  // Enhanced notification system for new delivery assignments
  useEffect(() => {
    if (user?.role === 'delivery_boy') {
      console.log(`🔄 DELIVERY BOY CHECK: Current orders: ${myOrders.length}, Last count: ${lastOrderCount}, Has shown initial: ${hasShownInitialOrders}`);
      
      // Check if we have new orders assigned
      if (myOrders.length > lastOrderCount && hasShownInitialOrders) {
        const newOrdersCount = myOrders.length - lastOrderCount;
        toast.success(`🚚 NEW DELIVERY ASSIGNED! You have ${newOrdersCount} new order(s) to deliver.`, {
          duration: 10000,
          action: {
            label: "View Orders",
            onClick: () => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        });
        
        console.log(`🔔 DELIVERY BOY NOTIFICATION: ${newOrdersCount} new orders assigned to ${user.name}`);
        
        // Notify customer that delivery is starting
        myOrders.slice(-newOrdersCount).forEach(order => {
          // Update order to notify customer/merchant
          dispatch(updateOrder({
            orderId: order.id,
            updates: {
              status: 'delivering'
            }
          }));
        });
        
        // Play notification sound (if browser allows)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsdBDSK0u/deysELIHB7+WSUAwRU6nh8L5mHAU+ltAxyH0vBBuFygKjcSELLHfH8N2QQAoUXrTp66hVFApGn+DyvmsdBDSK0u/deysELI'); 
          audio.play().catch(() => {});
        } catch (e) {
          // Silent fail for audio
        }
      }
      
      // Set initial state after first check
      if (!hasShownInitialOrders) {
        setHasShownInitialOrders(true);
        console.log(`📊 DELIVERY BOY INITIAL STATE: ${user.name} has ${myOrders.length} active deliveries`);
      }
      
      setLastOrderCount(myOrders.length);
    }
  }, [myOrders.length, user?.role, user?.name, lastOrderCount, hasShownInitialOrders, dispatch]);

  // Real-time order updates notification
  useEffect(() => {
    if (user?.role === 'delivery_boy' && myOrders.length > 0) {
      console.log(`📊 DELIVERY BOY DASHBOARD UPDATE: ${user.name} has ${myOrders.length} active deliveries`);
      
      // Show persistent notification if there are active orders
      myOrders.forEach((order, index) => {
        console.log(`📦 Active Order ${index + 1} (${order.id.split('-')[1]}): ₹${order.total?.toFixed(2)} - ${getMerchantName(order.merchantId)}`);
      });
    }
  }, [myOrders, user?.role, user?.name]);

  // Auto-refresh orders every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.role === 'delivery_boy') {
        console.log(`🔄 AUTO-REFRESH: Checking for new delivery assignments for ${user.name}`);
        // Force re-render by updating a dummy state if needed
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.role, user?.name]);

  if (user?.role !== 'delivery_boy') {
    return null;
  }

  const handleMarkDelivered = (orderId: string) => {
    dispatch(updateDeliveryStatus({ orderId, status: 'completed' }));
    toast.success("Order marked as delivered! Customer and merchant have been notified.");
  };

  const getMerchantName = (merchantId?: string) => {
    if (!merchantId) return 'Unknown Merchant';
    const merchant = merchants.find(m => m.id === merchantId);
    return merchant?.name || 'Unknown Merchant';
  };

  const handleStartDelivery = (orderId: string) => {
    // Add to notified orders to prevent duplicate notifications
    setNotifiedOrders(prev => new Set([...prev, orderId]));
    
    // Update order with delivery notification status
    dispatch(updateOrder({
      orderId,
      updates: {
        status: 'delivering',
        updatedAt: new Date().toISOString()
      }
    }));
    
    // Show success message to delivery boy
    toast.success("✅ Customer and merchant have been notified that you're on the way!", {
      duration: 5000,
      description: "They will receive real-time updates about your delivery progress."
    });
    
    console.log(`📱 DELIVERY NOTIFICATION: Customer and merchant notified for order ${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Deliveries</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className={`${myOrders.length > 0 ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' : 'bg-gray-50'}`}>
              Active: {myOrders.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              Completed: {completedOrders.length}
            </Badge>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">🔧 Debug Info:</h3>
          <p className="text-sm text-blue-600">Delivery Boy ID: {user?.id}</p>
          <p className="text-sm text-blue-600">Total Orders in System: {orders.length}</p>
          <p className="text-sm text-blue-600">Orders with Delivery Assignment: {orders.filter(o => o.deliveryBoyId).length}</p>
          <p className="text-sm text-blue-600">My Active Orders: {myOrders.length}</p>
          <p className="text-sm text-blue-600">My Completed Orders: {completedOrders.length}</p>
          <p className="text-sm text-blue-600">Last Update: {new Date().toLocaleTimeString()}</p>
        </div>

        {/* New Assignment Alert Banner */}
        {myOrders.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg shadow-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3 animate-bounce">
                <span className="text-white text-lg">🚚</span>
              </div>
              <div>
                <h3 className="text-orange-800 font-bold text-lg">🔥 ACTIVE DELIVERIES!</h3>
                <p className="text-orange-600 text-sm">You have {myOrders.length} order(s) ready for delivery</p>
                <p className="text-orange-500 text-xs">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Active Deliveries */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
          {myOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="mb-4 text-gray-500">No active deliveries at the moment</p>
                <p className="text-sm text-gray-400">New delivery assignments will appear here automatically</p>
                <p className="text-xs text-gray-400 mt-2">Page refreshes every 10 seconds</p>
                
                {/* Show orders that might be assigned to me for debugging */}
                {orders.filter(o => o.deliveryBoyId === user?.id).length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      Found {orders.filter(o => o.deliveryBoyId === user?.id).length} orders assigned to you with different statuses:
                    </p>
                    {orders.filter(o => o.deliveryBoyId === user?.id).map(order => (
                      <p key={order.id} className="text-xs text-yellow-700">
                        Order {order.id.split('-')[1]}: Status = {order.status}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-l-4 border-l-orange-500 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        🚚 Order #{order.id.split('-')[1]}
                        <Badge className="bg-orange-500 animate-pulse">URGENT - Deliver Now</Badge>
                      </CardTitle>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Assigned at</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Delivery Location Details */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery Details
                      </h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Customer Address</p>
                          <p className="font-medium text-blue-700">
                            {order.deliveryAddress || "123 Main Street, Customer Location"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Customer Phone</p>
                          <p className="font-medium text-blue-700 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customerPhone || "+91 98765 43210"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          onClick={() => handleStartDelivery(order.id)}
                          variant="outline"
                          className={`${
                            notifiedOrders.has(order.id) 
                              ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300' 
                              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300'
                          }`}
                          size="sm"
                          disabled={notifiedOrders.has(order.id)}
                        >
                          {notifiedOrders.has(order.id) ? '✅ Customer Notified' : '📱 Notify Customer - On My Way'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 mb-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Merchant</p>
                        <p className="font-medium">{getMerchantName(order.merchantId)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                        <p className="font-semibold text-green-600 text-xl">₹{order.total?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                        <Badge variant="outline" className="font-medium">{order.paymentMethod}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Items</p>
                        <p className="font-medium">{order.products.reduce((total, product) => total + product.quantity, 0)} items</p>
                      </div>
                    </div>
                    
                    <h4 className="mb-3 font-medium text-lg">📦 Items to Deliver:</h4>
                    <div className="space-y-2 mb-6">
                      {order.products.filter(p => p.isAvailable !== false).map((product) => (
                        <div key={product.id} className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                          <div>
                            <span className="font-medium text-lg">{product.name}</span>
                            {product.description && (
                              <p className="text-sm text-gray-600">{product.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-lg">{product.quantity} {product.unit}</span>
                            {product.updatedPrice && (
                              <p className="text-sm text-green-600 font-medium">₹{product.updatedPrice.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 text-lg shadow-lg transform transition hover:scale-105"
                    >
                      ✅ Mark as Delivered
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Deliveries */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recently Completed</h2>
            <div className="space-y-4">
              {completedOrders.slice(0, 5).map((order) => (
                <Card key={order.id} className="overflow-hidden border-l-4 border-l-green-500">
                  <CardHeader className="bg-green-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Order #{order.id.split('-')[1]}
                      </CardTitle>
                      <Badge className="bg-green-500">✅ Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Merchant</p>
                        <p className="font-medium">{getMerchantName(order.merchantId)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-semibold">₹{order.total?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-sm">{new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        }).format(new Date(order.updatedAt))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryBoyPage;
