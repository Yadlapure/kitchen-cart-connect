
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import ProductCard from "@/components/ProductCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { updateOrder } from "@/store/appSlice";
import { toast } from "sonner";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);

  const order = orders.find(o => o.id === orderId);

  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(order?.estimatedDeliveryTime || "");
  const [quoteNotes, setQuoteNotes] = useState(order?.quoteNotes || "");
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || "COD");

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

  const handleStatusUpdate = (newStatus: string) => {
    dispatch(updateOrder({
      orderId: order.id,
      updates: { status: newStatus as any }
    }));
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleQuoteSubmit = () => {
    const total = order.products.reduce((sum, product) => {
      return sum + (product.updatedPrice || product.price || 0) * product.quantity;
    }, 0);

    dispatch(updateOrder({
      orderId: order.id,
      updates: {
        status: 'quoted',
        total,
        estimatedDeliveryTime,
        quoteNotes,
        paymentMethod: paymentMethod as any
      }
    }));
    toast.success("Quote submitted successfully!");
  };

  const canManageOrder = user?.role === 'merchant';
  const isCustomer = user?.role === 'customer';

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

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle>Ordered Items</CardTitle>
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
          </div>

          {/* Actions Sidebar */}
          <div>
            {canManageOrder && order.status === 'requested' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Submit Quote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Estimated Delivery Time
                    </label>
                    <Input
                      value={estimatedDeliveryTime}
                      onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                      placeholder="e.g., 2-3 business days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Method
                    </label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                        <SelectItem value="Online">Online Payment</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quote Notes (Optional)
                    </label>
                    <Textarea
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      placeholder="Additional notes about availability, delivery, etc."
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleQuoteSubmit}
                    className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                  >
                    Submit Quote
                  </Button>
                </CardContent>
              </Card>
            )}

            {isCustomer && order.status === 'quoted' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Quote Received</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    The merchant has provided a quote for your order. 
                    Review the details and confirm if you'd like to proceed.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleStatusUpdate('confirmed')}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      Accept Quote
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/orders')}
                      className="w-full"
                    >
                      Back to Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {canManageOrder && ['confirmed', 'processing', 'delivering'].includes(order.status) && (
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => handleStatusUpdate('processing')}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Start Processing
                    </Button>
                  )}
                  {order.status === 'processing' && (
                    <Button 
                      onClick={() => handleStatusUpdate('delivering')}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Out for Delivery
                    </Button>
                  )}
                  {order.status === 'delivering' && (
                    <Button 
                      onClick={() => handleStatusUpdate('completed')}
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
