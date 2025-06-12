
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

  const handleMarkDelivered = (orderId: string) => {
    dispatch(updateDeliveryStatus({ orderId, status: 'completed' }));
    toast.success("Order marked as delivered!");
  };

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find(m => m.id === merchantId);
    return merchant?.name || 'Unknown Merchant';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">My Deliveries</h1>
        
        {myOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">No deliveries assigned at the moment</p>
              <p className="text-sm text-gray-400">New delivery assignments will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-blue-50">
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
                      <p>{getMerchantName(order.merchantId)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Amount</p>
                      <p className="font-semibold">₹{order.total?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <p>{order.paymentMethod}</p>
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
      </main>
    </div>
  );
};

export default DeliveryBoyPage;
