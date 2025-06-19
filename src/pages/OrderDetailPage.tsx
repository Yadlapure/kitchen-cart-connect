
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ProductCard from "@/components/ProductCard";
import MerchantQuoteCard from "@/components/MerchantQuoteCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectMerchantQuote, updateOrder, assignDeliveryBoy } from "@/store/appSlice";
import { toast } from "sonner";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, merchants, deliveryBoys } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [hasShownQuoteNotification, setHasShownQuoteNotification] = useState(false);

  const order = orders.find(o => o.id === orderId);

  // Enhanced notification system for customers when quotes arrive
  useEffect(() => {
    if (order && user?.role === 'customer' && order.status === 'quoted' && order.merchantQuotes.length > 0 && !hasShownQuoteNotification) {
      console.log('Showing quote notification to customer:', {
        orderId: order.id,
        quotesCount: order.merchantQuotes.length,
        status: order.status
      });
      
      toast.success(`🎉 New quotes received! You have ${order.merchantQuotes.length} quote(s) from merchants to review.`, {
        duration: 6000,
        action: {
          label: "Review Quotes",
          onClick: () => {
            const quotesSection = document.getElementById('quotes-section');
            if (quotesSection) {
              quotesSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
      setHasShownQuoteNotification(true);
    }
  }, [order?.status, order?.merchantQuotes?.length, user?.role, hasShownQuoteNotification]);

  // Reset notification flag when order changes or status changes
  useEffect(() => {
    setHasShownQuoteNotification(false);
  }, [orderId, order?.status]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container px-4 py-8 mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Order not found</p>
              <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleSelectQuote = (merchantId: string) => {
    dispatch(selectMerchantQuote({ orderId: order.id, merchantId }));
    toast.success("Quote selected! Merchant has been notified and will start processing your order.");
  };

  const handleStatusUpdate = (newStatus: 'processing' | 'delivering') => {
    dispatch(updateOrder({ 
      orderId: order.id, 
      updates: { status: newStatus }
    }));
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleAssignDeliveryBoy = () => {
    if (!selectedDeliveryBoy) {
      toast.error("Please select a delivery boy");
      return;
    }
    
    dispatch(assignDeliveryBoy({ 
      orderId: order.id, 
      deliveryBoyId: selectedDeliveryBoy 
    }));
    
    dispatch(updateOrder({ 
      orderId: order.id, 
      updates: { status: 'delivering' }
    }));
    
    toast.success("Delivery boy assigned and order sent for delivery!");
  };

  const isMerchant = user?.role === 'merchant';
  const isCustomer = user?.role === 'customer';
  const merchantQuote = order.merchantQuotes?.find(q => q.merchantId === user?.id);
  const availableDeliveryBoys = deliveryBoys.filter(db => db.isAvailable);

  console.log('Order details:', {
    orderId: order.id,
    status: order.status,
    quotesCount: order.merchantQuotes?.length || 0,
    selectedQuote: order.selectedQuote,
    userRole: user?.role,
    hasShownNotification: hasShownQuoteNotification,
    orderUpdatedAt: order.updatedAt
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id.split('-')[1]}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Enhanced notification banner for customers when quotes are available */}
        {isCustomer && order.status === 'quoted' && order.merchantQuotes.length > 0 && !order.selectedQuote && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg">🎉</span>
              </div>
              <h3 className="text-green-800 font-bold text-lg">New Quotes Available!</h3>
            </div>
            <p className="text-green-700 mb-2">
              Great news! You have received <strong>{order.merchantQuotes.length} quote(s)</strong> from merchants.
            </p>
            <p className="text-green-600 text-sm">
              📋 Review the detailed quotes below and select the one that best fits your needs and budget.
            </p>
            <Button 
              className="mt-3 bg-green-500 hover:bg-green-600"
              onClick={() => {
                const quotesSection = document.getElementById('quotes-section');
                if (quotesSection) {
                  quotesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Review Quotes Now
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p>{new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }).format(new Date(order.createdAt))}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p>{new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }).format(new Date(order.updatedAt))}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p>{order.paymentMethod || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-lg font-semibold">{order.total ? `₹${order.total.toFixed(2)}` : 'Pending quote'}</p>
                  </div>
                </div>

                {order.estimatedDeliveryTime && (
                  <div className="px-4 py-2 mt-4 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Estimated delivery:</span> {order.estimatedDeliveryTime}
                    </p>
                  </div>
                )}

                {order.quoteNotes && (
                  <div className="px-4 py-2 mt-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-1">Quote Notes:</p>
                    <p className="text-sm text-gray-600">{order.quoteNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Original Products for Reference */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Requested Items</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Merchant Quote Interface */}
            {isMerchant && order.selectedMerchants?.includes(user.id) && ['requested', 'quoted'].includes(order.status) && (
              <MerchantQuoteCard
                orderId={order.id}
                merchantId={user.id}
                products={order.products}
                existingQuote={merchantQuote}
              />
            )}

            {/* Enhanced Customer Quote Selection */}
            {isCustomer && order.status === 'quoted' && order.merchantQuotes.length > 0 && (
              <div id="quotes-section" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Available Quotes ({order.merchantQuotes.length})</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {order.selectedQuote ? 'Quote Selected' : 'Choose a Quote'}
                  </Badge>
                </div>
                
                {order.merchantQuotes.map((quote) => {
                  const merchant = merchants.find(m => m.id === quote.merchantId);
                  const isSelected = order.selectedQuote === quote.merchantId;
                  return (
                    <Card key={quote.merchantId} className={`transition-all duration-200 ${isSelected ? 'border-2 border-green-500 bg-green-50 shadow-lg' : 'hover:shadow-md border hover:border-gray-300'}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium flex items-center gap-2">
                              {merchant?.name}
                              {isSelected && <Badge className="bg-green-500">✓ Selected</Badge>}
                            </h4>
                            <p className="text-sm text-gray-600">Rating: {merchant?.rating}/5 ⭐</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">₹{quote.total.toFixed(2)}</p>
                            {quote.estimatedDeliveryTime && (
                              <p className="text-sm text-gray-600">📅 {quote.estimatedDeliveryTime}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          {quote.products.map((product) => (
                            <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{product.name}</span>
                                <p className="text-sm text-gray-600">
                                  {product.quantity} {product.unit}
                                </p>
                              </div>
                              <div className="text-right">
                                {product.isAvailable ? (
                                  <div>
                                    <p className="font-medium">₹{product.updatedPrice}</p>
                                    <Badge variant="outline" className="text-green-600 border-green-600">Available</Badge>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-red-600 border-red-600">Not Available</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {quote.quoteNotes && (
                          <div className="p-3 bg-blue-50 rounded mb-4">
                            <p className="text-sm text-blue-800">💬 {quote.quoteNotes}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div>
                            <Badge variant="outline">{quote.paymentMethod}</Badge>
                          </div>
                          {!isSelected && !order.selectedQuote && (
                            <Button 
                              onClick={() => handleSelectQuote(quote.merchantId)}
                              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                            >
                              Select This Quote
                            </Button>
                          )}
                          {isSelected && (
                            <Badge className="bg-green-500 text-white px-4 py-2">
                              ✓ Your Choice
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div>
            {/* Show notification status for merchants */}
            {isMerchant && order.selectedQuote && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quote Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.selectedQuote === user.id ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-medium">🎉 Your quote was selected!</p>
                      <p className="text-sm text-green-600 mt-1">Please prepare the order for delivery.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-orange-800 font-medium">Quote not selected</p>
                      <p className="text-sm text-orange-600 mt-1">Customer chose another merchant's quote.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Status update and delivery assignment for selected merchant */}
            {isMerchant && order.selectedQuote === user.id && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => handleStatusUpdate('processing')}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Start Processing Order
                    </Button>
                  )}
                  
                  {order.status === 'processing' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Assign Delivery Boy</label>
                        <Select value={selectedDeliveryBoy} onValueChange={setSelectedDeliveryBoy}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery boy" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDeliveryBoys.map((db) => (
                              <SelectItem key={db.id} value={db.id}>
                                {db.name} - {db.phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={handleAssignDeliveryBoy}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={!selectedDeliveryBoy}
                      >
                        Assign & Send for Delivery
                      </Button>
                    </div>
                  )}

                  {order.status === 'delivering' && order.deliveryBoyId && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800 font-medium">📦 Order Out for Delivery</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Assigned to: {deliveryBoys.find(db => db.id === order.deliveryBoyId)?.name}
                      </p>
                    </div>
                  )}

                  {order.status === 'completed' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-medium">✅ Order Completed</p>
                      <p className="text-sm text-green-600 mt-1">Order has been delivered successfully!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
