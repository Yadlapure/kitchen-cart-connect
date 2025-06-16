
import { useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { updateDeliveryStatus } from "@/store/appSlice";
import { toast } from "sonner";

const DeliveryBoyPage = () => {
  const { orders, merchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.role !== 'delivery_boy') {
      navigate('/');
    }
  }, [user, navigate]);

  if (user?.role !== 'delivery_boy') {
    return null;
  }

  const myOrders = orders.filter(order => 
    order.deliveryBoyId === user.id && order.status === 'delivering'
  );

  const completedOrders = orders.filter(order => 
    order.deliveryBoyId === user.id && order.status === 'completed'
  );

  const handleMarkDelivered = (orderId: string) => {
    dispatch(updateDeliveryStatus({ orderId, status: 'completed' }));
    toast.success("Order marked as delivered! Merchant has been notified.");
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find(m => m.id === merchantId);
    return merchant?.name || 'Unknown Merchant';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Deliveries</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-orange-50">
              Active: {myOrders.length}
            </Badge>
            <Badge variant="outline" className="bg-green-50">
              Completed: {completedOrders.length}
            </Badge>
          </div>
        </div>
        
        {/* Active Deliveries */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
          {myOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-gray-500">No active deliveries at the moment</p>
                <p className="text-sm text-gray-400">New delivery assignments will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-l-4 border-l-orange-500">
                  <CardHeader className="bg-orange-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Order #{order.id.split('-')[1]}
                      </CardTitle>
                      <Badge className="bg-orange-500">Out for Delivery</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 mb-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Merchant</p>
                        <p className="font-medium">{getMerchantName(order.merchantId)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                        <p className="font-semibold text-green-600">₹{order.total?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Payment Method</p>
                        <Badge variant="outline">{order.paymentMethod}</Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Items</p>
                        <p>{order.products.reduce((total, product) => total + product.quantity, 0)} items</p>
                      </div>
                    </div>
                    
                    <h4 className="mb-2 font-medium">Items to Deliver:</h4>
                    <div className="space-y-2 mb-4">
                      {order.products.filter(p => p.isAvailable !== false).map((product) => (
                        <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.description && (
                              <p className="text-sm text-gray-600">{product.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-medium">{product.quantity} {product.unit}</span>
                            {product.updatedPrice && (
                              <p className="text-sm text-gray-600">₹{product.updatedPrice.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => handleMarkDelivered(order.id)}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      Mark as Delivered
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
                      <Badge className="bg-green-500">Completed</Badge>
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
                        }).format(order.updatedAt)}</p>
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
