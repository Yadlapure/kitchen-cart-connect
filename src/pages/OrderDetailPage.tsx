
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ProductCard from "@/components/ProductCard";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { useState } from "react";

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, merchants, updateOrder, currentUser } = useApp();
  const [selectedPayment, setSelectedPayment] = useState<'COD' | 'Online' | 'UPI'>('COD');
  
  const order = orders.find((o) => o.id === orderId);
  const merchant = order ? merchants.find((m) => m.id === order.merchantId) : null;
  
  if (!order || !merchant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container px-4 py-8 mx-auto text-center sm:px-6">
          <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
          <p className="mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = () => {
    updateOrder(order.id, {
      status: 'confirmed',
      paymentMethod: selectedPayment
    });
    toast.success("Order confirmed successfully!");
  };

  const handleUpdateOrderStatus = (status: typeof order.status) => {
    updateOrder(order.id, { status });
    
    let message = "";
    switch(status) {
      case "processing":
        message = "Order is now being processed";
        break;
      case "delivering":
        message = "Order is out for delivery";
        break;
      case "completed":
        message = "Order marked as completed";
        break;
      default:
        message = `Order status updated to ${status}`;
    }
    
    toast.success(message);
  };

  const calculateTotal = () => {
    if (!order.total && order.products.every(p => p.updatedPrice !== undefined)) {
      return order.products.reduce((total, product) => {
        return total + (product.updatedPrice || 0) * product.quantity;
      }, 0);
    }
    return order.total || 0;
  };
  
  const renderActions = () => {
    if (currentUser === 'customer') {
      if (order.status === 'quoted') {
        return (
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Confirm Your Order</h3>
            
            <div className="mb-6">
              <h4 className="mb-2 font-medium">Select Payment Method</h4>
              <RadioGroup defaultValue="COD" value={selectedPayment} onValueChange={(val) => setSelectedPayment(val as any)}>
                <div className="flex items-center mb-2 space-x-2">
                  <RadioGroupItem value="COD" id="payment-cod" />
                  <Label htmlFor="payment-cod">Cash on Delivery</Label>
                </div>
                <div className="flex items-center mb-2 space-x-2">
                  <RadioGroupItem value="Online" id="payment-online" />
                  <Label htmlFor="payment-online">Online Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="UPI" id="payment-upi" />
                  <Label htmlFor="payment-upi">UPI</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
              onClick={handleConfirmOrder}
            >
              Confirm Order
            </Button>
          </div>
        );
      }
    } else {
      // Merchant actions
      if (order.status === 'requested') {
        return (
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Respond to Request</h3>
            
            <Button 
              className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
              onClick={() => {
                // In a real app, update prices for each product
                const updatedProducts = order.products.map(p => ({
                  ...p,
                  updatedPrice: p.price || Math.floor(Math.random() * 500) + 50,
                  isAvailable: Math.random() > 0.1 // Simulate some items being unavailable
                }));
                
                const total = updatedProducts.reduce((sum, p) => {
                  if (p.isAvailable === false) return sum;
                  return sum + (p.updatedPrice || 0) * p.quantity;
                }, 0);
                
                updateOrder(order.id, { 
                  status: 'quoted',
                  products: updatedProducts,
                  total
                });
                toast.success("Quote sent to customer");
              }}
            >
              Send Quote
            </Button>
          </div>
        );
      } else if (order.status === 'confirmed') {
        return (
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Process Order</h3>
            
            <div className="mb-4">
              <Button 
                className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600 mb-2"
                onClick={() => {
                  updateOrder(order.id, {
                    status: 'processing',
                    estimatedDeliveryTime: '30-45 minutes'
                  });
                  toast.success("Order is now being processed");
                }}
              >
                Start Processing
              </Button>
            </div>
          </div>
        );
      } else if (order.status === 'processing') {
        return (
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Order in Progress</h3>
            <Button 
              className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
              onClick={() => handleUpdateOrderStatus('delivering')}
            >
              Mark as Out for Delivery
            </Button>
          </div>
        );
      } else if (order.status === 'delivering') {
        return (
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Order Out for Delivery</h3>
            <Button 
              className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
              onClick={() => handleUpdateOrderStatus('completed')}
            >
              Mark as Delivered
            </Button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Order #{order.id.split('-')[1]}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 mb-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Merchant</h3>
                    <p className="font-medium">{merchant.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                    <p>{new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }).format(order.createdAt)}</p>
                  </div>
                  {order.paymentMethod && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                      <p>{order.paymentMethod}</p>
                    </div>
                  )}
                  {order.estimatedDeliveryTime && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Estimated Delivery</h3>
                      <p>{order.estimatedDeliveryTime}</p>
                    </div>
                  )}
                </div>
                
                <h3 className="mb-3 text-lg font-medium">Items</h3>
                <div className="space-y-4">
                  {order.products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      editable={false} 
                      isOrderView={true} 
                    />
                  ))}
                </div>
                
                {(order.status === 'quoted' || order.status === 'confirmed' || 
                  order.status === 'processing' || order.status === 'delivering' || 
                  order.status === 'completed') && (
                  <div className="p-4 mt-6 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Status Timeline */}
                  <div className="relative pl-8 space-y-6 border-l-2 border-gray-200">
                    <div className={`relative ${order.status === 'requested' || order.status === 'quoted' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'text-kitchen-600' : 'text-gray-500'}`}>
                      <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${order.status === 'requested' || order.status === 'quoted' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'bg-kitchen-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <h4 className="font-medium">Request Received</h4>
                      <p className="text-sm">The merchant has received your request</p>
                    </div>

                    <div className={`relative ${order.status === 'quoted' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'text-kitchen-600' : 'text-gray-500'}`}>
                      <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${order.status === 'quoted' || order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'bg-kitchen-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <h4 className="font-medium">Quote Provided</h4>
                      <p className="text-sm">The merchant has sent the pricing</p>
                    </div>

                    <div className={`relative ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'text-kitchen-600' : 'text-gray-500'}`}>
                      <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'bg-kitchen-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <h4 className="font-medium">Order Confirmed</h4>
                      <p className="text-sm">You've confirmed the order</p>
                    </div>

                    <div className={`relative ${order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'text-kitchen-600' : 'text-gray-500'}`}>
                      <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${order.status === 'processing' || order.status === 'delivering' || order.status === 'completed' ? 'bg-kitchen-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <h4 className="font-medium">Processing</h4>
                      <p className="text-sm">Your order is being prepared</p>
                    </div>

                    <div className={`relative ${order.status === 'delivering' || order.status === 'completed' ? 'text-kitchen-600' : 'text-gray-500'}`}>
                      <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${order.status === 'delivering' || order.status === 'completed' ? 'bg-kitchen-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <h4 className="font-medium">Out for Delivery</h4>
                      <p className="text-sm">Your order is on the way</p>
                    </div>

                    <div className={`relative ${order.status === 'completed' ? 'text-kitchen-600' : 'text-gray-500'}`}>
                      <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center">
                        <div className={`w-4 h-4 rounded-full ${order.status === 'completed' ? 'bg-kitchen-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <h4 className="font-medium">Delivered</h4>
                      <p className="text-sm">Your order has been delivered</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {renderActions()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
