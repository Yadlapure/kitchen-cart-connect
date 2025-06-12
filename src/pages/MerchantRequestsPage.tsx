
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

  // Filter orders where this merchant is selected and request is active
  const requestedOrders = orders.filter((order) => 
    order.selectedMerchants?.includes(user.id) && 
    (order.status === 'requested' || (order.status === 'quoted' && !order.merchantQuotes.find(q => q.merchantId === user.id)))
  );

  const getMerchantQuoteStatus = (order: any) => {
    const merchantQuote = order.merchantQuotes?.find((q: any) => q.merchantId === user.id);
    if (merchantQuote) {
      return 'Quote Submitted';
    }
    return 'Pending Quote';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Incoming Requests</h1>
        
        {requestedOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">No new requests at the moment</p>
              <p className="text-sm text-gray-400">New customer requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requestedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Request #{order.id.split('-')[1]}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getMerchantQuoteStatus(order) === 'Quote Submitted' ? 'default' : 'outline'}>
                        {getMerchantQuoteStatus(order)}
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
                  
                  <Button 
                    className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    {getMerchantQuoteStatus(order) === 'Quote Submitted' ? 'View/Edit Quote' : 'Create Quote'}
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

export default MerchantRequestsPage;
