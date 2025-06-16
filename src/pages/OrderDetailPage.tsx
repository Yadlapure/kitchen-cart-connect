
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ProductCard from "@/components/ProductCard";
import MerchantQuoteCard from "@/components/MerchantQuoteCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { selectMerchantQuote } from "@/store/appSlice";
import { toast } from "sonner";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, merchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);

  const order = orders.find(o => o.id === orderId);

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
    toast.success("Quote selected! Merchant has been notified.");
  };

  const isMerchant = user?.role === 'merchant';
  const isCustomer = user?.role === 'customer';
  const merchantQuote = order.merchantQuotes?.find(q => q.merchantId === user?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id.split('-')[1]}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

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
                    }).format(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p>{new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    }).format(order.updatedAt)}</p>
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

            {/* Customer Quote Selection */}
            {isCustomer && order.status === 'quoted' && order.merchantQuotes.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Merchant Quotes</h3>
                {order.merchantQuotes.map((quote) => {
                  const merchant = merchants.find(m => m.id === quote.merchantId);
                  return (
                    <Card key={quote.merchantId} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium">{merchant?.name}</h4>
                          <p className="text-sm text-gray-600">Rating: {merchant?.rating}/5</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{quote.total.toFixed(2)}</p>
                          {quote.estimatedDeliveryTime && (
                            <p className="text-sm text-gray-600">{quote.estimatedDeliveryTime}</p>
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
                          <p className="text-sm text-blue-800">{quote.quoteNotes}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div>
                          <Badge>{quote.paymentMethod}</Badge>
                        </div>
                        <Button 
                          onClick={() => handleSelectQuote(quote.merchantId)}
                          className="bg-green-500 hover:bg-green-600"
                          disabled={order.selectedQuote === quote.merchantId}
                        >
                          {order.selectedQuote === quote.merchantId ? 'Selected' : 'Select This Quote'}
                        </Button>
                      </div>
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

            {/* Status update buttons for selected merchant */}
            {isMerchant && order.selectedQuote === user.id && ['confirmed', 'processing', 'delivering'].includes(order.status) && (
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => {
                        // Handle status update
                        toast.success("Order processing started");
                      }}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Start Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button 
                      onClick={() => {
                        // Handle status update
                        toast.success("Order out for delivery");
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Out for Delivery
                    </Button>
                  )}
                  {order.status === 'delivering' && (
                    <Button 
                      onClick={() => {
                        // Handle status update
                        toast.success("Order delivered");
                      }}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      Mark as Delivered
                    </Button>
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
