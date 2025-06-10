import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [quoteNotes, setQuoteNotes] = useState('');
  
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

  // Initialize quote items when component loads
  useState(() => {
    if (order.status === 'requested' && quoteItems.length === 0) {
      setQuoteItems(order.products.map(p => ({
        ...p,
        quotedPrice: p.price || 0,
        isAvailable: true
      })));
    } else if (order.status === 'quoted') {
      setQuoteItems(order.products);
    }
  });

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

  const handleQuoteItemChange = (itemId: string, field: string, value: any) => {
    setQuoteItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const handleSendQuote = () => {
    const total = quoteItems.reduce((sum, item) => {
      if (!item.isAvailable) return sum;
      return sum + (item.quotedPrice || 0) * item.quantity;
    }, 0);

    updateOrder(order.id, {
      status: 'quoted',
      products: quoteItems.map(item => ({
        ...item,
        updatedPrice: item.quotedPrice,
        isAvailable: item.isAvailable
      })),
      total,
      quoteNotes
    });
    
    toast.success("Quote sent to customer successfully!");
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
            <h3 className="mb-4 text-lg font-semibold">Quote Received</h3>
            
            {/* Quote Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Quote Details</h4>
              <div className="space-y-2">
                {order.products.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">×{item.quantity}</span>
                      {item.isAvailable === false && (
                        <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          Not Available
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {item.isAvailable === false ? (
                        <span className="text-gray-400">--</span>
                      ) : (
                        <>
                          <div className="font-semibold">₹{(item.updatedPrice || 0).toFixed(2)}</div>
                          {item.price && item.price !== item.updatedPrice && (
                            <div className="text-sm text-gray-400 line-through">₹{item.price.toFixed(2)}</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {order.quoteNotes && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <h5 className="font-medium text-sm text-gray-600 mb-1">Merchant Notes:</h5>
                  <p className="text-sm">{order.quoteNotes}</p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h4 className="mb-3 font-medium">Select Payment Method</h4>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD"
                    checked={selectedPayment === 'COD'}
                    onChange={(e) => setSelectedPayment(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when your order arrives</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Online"
                    checked={selectedPayment === 'Online'}
                    onChange={(e) => setSelectedPayment(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-gray-500">Pay securely online</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="UPI"
                    checked={selectedPayment === 'UPI'}
                    onChange={(e) => setSelectedPayment(e.target.value as any)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">UPI</div>
                    <div className="text-sm text-gray-500">Pay via UPI apps</div>
                  </div>
                </label>
              </div>
            </div>
            
            <Button 
              className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
              onClick={handleConfirmOrder}
            >
              Confirm Order - ₹{calculateTotal().toFixed(2)}
            </Button>
          </div>
        );
      }
    } else {
      // Merchant actions
      if (order.status === 'requested') {
        return (
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Create Quote</h3>
            
            <div className="space-y-4 mb-6">
              {quoteItems.map((item, index) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {item.price && (
                        <p className="text-sm text-gray-600">Requested Price: ₹{item.price.toFixed(2)}</p>
                      )}
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={(e) => handleQuoteItemChange(item.id, 'isAvailable', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Available</span>
                    </label>
                  </div>
                  
                  {item.isAvailable && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Price (per unit)</label>
                      <Input
                        type="number"
                        value={item.quotedPrice || ''}
                        onChange={(e) => handleQuoteItemChange(item.id, 'quotedPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Enter your price"
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Total for this item: ₹{((item.quotedPrice || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
              <Textarea
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="Add any notes about the quote, delivery time, or special instructions..."
                rows={3}
              />
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between items-center font-bold">
                <span>Quote Total:</span>
                <span>₹{quoteItems.reduce((sum, item) => {
                  if (!item.isAvailable) return sum;
                  return sum + (item.quotedPrice || 0) * item.quantity;
                }, 0).toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
              onClick={handleSendQuote}
              disabled={quoteItems.every(item => !item.isAvailable)}
            >
              Send Quote to Customer
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
