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
  const [lastOrderUpdate, setLastOrderUpdate] = useState("");

  const order = orders.find(o => o.id === orderId);

  // Enhanced notification system for ACTUAL quote submissions only
  useEffect(() => {
    if (order && user?.role === 'customer') {
      // Count only ACTUALLY submitted quotes (not just verification data)
      const actuallySubmittedQuotes = order.merchantQuotes?.filter(q => 
        q.isQuoteSubmitted === true && q.submittedAt
      ) || [];
      
      const orderUpdateTime = new Date(order.updatedAt).getTime();
      const lastNotificationTime = lastOrderUpdate ? new Date(lastOrderUpdate).getTime() : 0;
      
      // Show notification ONLY when:
      // 1. Order status is 'quoted' (meaning at least one quote was actually submitted)
      // 2. There are actually submitted quotes
      // 3. Order was updated after our last notification 
      // 4. We haven't shown notification for this update yet
      if (order.status === 'quoted' && 
          actuallySubmittedQuotes.length > 0 && 
          orderUpdateTime > lastNotificationTime &&
          !hasShownQuoteNotification) {
        
        console.log('🔔 CUSTOMER NOTIFICATION: New actual quotes available:', {
          orderId: order.id,
          actualQuotesCount: actuallySubmittedQuotes.length,
          status: order.status,
          updatedAt: order.updatedAt
        });
        
        toast.success(`🎉 NEW QUOTES RECEIVED! You have ${actuallySubmittedQuotes.length} quote(s) from merchants ready for review.`, {
          duration: 10000,
          action: {
            label: "Review Now →",
            onClick: () => {
              const quotesSection = document.getElementById('quotes-section');
              if (quotesSection) {
                quotesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }
        });
        
        setHasShownQuoteNotification(true);
        setLastOrderUpdate(order.updatedAt);
      }
    }
  }, [order?.status, order?.merchantQuotes?.length, order?.updatedAt, user?.role, hasShownQuoteNotification, lastOrderUpdate]);

  // Reset notification flag when navigating to different order
  useEffect(() => {
    setHasShownQuoteNotification(false);
    setLastOrderUpdate("");
  }, [orderId]);

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
  const merchantQuote = order?.merchantQuotes?.find(q => q.merchantId === user?.id);
  const availableDeliveryBoys = deliveryBoys.filter(db => db.isAvailable);

  // Get only actually submitted quotes for customer view
  const actuallySubmittedQuotes = order?.merchantQuotes?.filter(q => 
    q.isQuoteSubmitted === true && q.submittedAt
  ) || [];

  console.log('📊 OrderDetailPage State:', {
    orderId: order?.id,
    status: order?.status,
    totalQuoteEntries: order?.merchantQuotes?.length || 0,
    actuallySubmittedQuotes: actuallySubmittedQuotes.length,
    selectedQuote: order?.selectedQuote,
    userRole: user?.role,
    hasShownNotification: hasShownQuoteNotification
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id.split('-')[1]}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* ENHANCED notification banner for customers when ACTUAL quotes are available */}
        {isCustomer && order?.status === 'quoted' && actuallySubmittedQuotes.length > 0 && !order.selectedQuote && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 animate-bounce">
                <span className="text-white text-xl">🎉</span>
              </div>
              <div>
                <h3 className="text-green-800 font-bold text-xl">🔥 FRESH QUOTES AVAILABLE!</h3>
                <p className="text-green-600 text-sm">Updated {new Date(order.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white/70 p-4 rounded-lg mb-4">
              <p className="text-green-800 font-medium text-lg mb-2">
                ✨ You have received <span className="bg-green-200 px-2 py-1 rounded font-bold">{actuallySubmittedQuotes.length} quote(s)</span> from merchants!
              </p>
              <p className="text-green-700">
                📋 Compare prices, delivery times, and merchant ratings below to choose the best option for your needs.
              </p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 text-lg shadow-lg transform transition hover:scale-105"
              onClick={() => {
                const quotesSection = document.getElementById('quotes-section');
                if (quotesSection) {
                  quotesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              🚀 Review Quotes Now →
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

                {/* Real-time status indicator */}
                {order.status === 'quoted' && (
                  <div className="px-4 py-3 mt-4 bg-green-50 border-l-4 border-green-500 rounded-r-md">
                    <p className="text-sm text-green-800">
                      <span className="font-bold">🎯 Status Update:</span> Quotes received from {order.merchantQuotes.length} merchant(s)
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Last updated: {new Date(order.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}

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
            {isMerchant && order?.selectedMerchants?.includes(user.id) && ['requested', 'quoted'].includes(order.status) && (
              <MerchantQuoteCard
                orderId={order.id}
                merchantId={user.id}
                products={order.products}
                existingQuote={merchantQuote}
              />
            )}

            {/* Enhanced Customer Quote Selection - show only ACTUAL quotes */}
            {isCustomer && order?.status === 'quoted' && actuallySubmittedQuotes.length > 0 && (
              <div id="quotes-section" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Available Quotes ({actuallySubmittedQuotes.length})</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {order.selectedQuote ? 'Quote Selected' : 'Choose a Quote'}
                  </Badge>
                </div>
                
                {actuallySubmittedQuotes.map((quote) => {
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
