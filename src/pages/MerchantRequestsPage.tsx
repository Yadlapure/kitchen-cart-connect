
import { useEffect } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";

const MerchantRequestsPage = () => {
  const { orders } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.role !== 'merchant') {
      navigate('/');
    }
  }, [user, navigate]);

  if (user?.role !== 'merchant') {
    return null;
  }

  // Filter orders where this merchant is selected
  const merchantOrders = orders.filter((order) => 
    order.selectedMerchants?.includes(user.id)
  );

  const getMerchantQuoteStatus = (order: any) => {
    const merchantQuote = order.merchantQuotes?.find((q: any) => q.merchantId === user.id);
    
    if (order.selectedQuote === user.id) {
      return { status: 'Selected', color: 'bg-green-500' };
    } else if (order.selectedQuote && order.selectedQuote !== user.id) {
      return { status: 'Not Selected', color: 'bg-orange-500' };
    } else if (merchantQuote) {
      return { status: 'Quote Submitted', color: 'bg-blue-500' };
    }
    return { status: 'Pending Quote', color: 'bg-gray-500' };
  };

  const getOrderActionText = (order: any) => {
    const merchantQuote = order.merchantQuotes?.find((q: any) => q.merchantId === user.id);
    
    if (order.selectedQuote === user.id) {
      return 'Manage Order';
    } else if (order.selectedQuote && order.selectedQuote !== user.id) {
      return 'View Quote';
    } else if (merchantQuote) {
      return 'View/Edit Quote';
    }
    return 'Create Quote';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">My Orders & Requests</h1>
        
        {merchantOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">No requests at the moment</p>
              <p className="text-sm text-gray-400">New customer requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {merchantOrders.map((order) => {
              const quoteStatus = getMerchantQuoteStatus(order);
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Request #{order.id.split('-')[1]}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={quoteStatus.color}>
                          {quoteStatus.status}
                        </Badge>
                        {order.selectedMerchants && order.selectedMerchants.length > 1 && (
                          <Badge variant="secondary">
                            Multi-merchant ({order.selectedMerchants.length} merchants)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 mb-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Requested On</p>
                        <p>{new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }).format(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Items</p>
                        <p>{order.products.reduce((total, product) => total + product.quantity, 0)} items</p>
                      </div>
                      {order.selectedQuote === user.id && order.total && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Order Value</p>
                          <p className="text-lg font-semibold text-green-600">₹{order.total.toFixed(2)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                    
                    <h4 className="mb-2 font-medium">Items Requested:</h4>
                    <div className="space-y-2 mb-4">
                      {order.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.description && (
                              <p className="text-sm text-gray-600">{product.description}</p>
                            )}
                          </div>
                          <span className="font-medium">{product.quantity} {product.unit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Show quote notification */}
                    {order.selectedQuote === user.id && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded mb-4">
                        <p className="text-green-800 font-medium">🎉 Your quote was selected by the customer!</p>
                      </div>
                    )}

                    {order.selectedQuote && order.selectedQuote !== user.id && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded mb-4">
                        <p className="text-orange-800 font-medium">Customer selected another merchant's quote</p>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      {getOrderActionText(order)}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MerchantRequestsPage;
