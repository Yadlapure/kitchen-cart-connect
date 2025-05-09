
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const MerchantRequestsPage = () => {
  const { orders, merchants, currentUser } = useApp();
  const navigate = useNavigate();
  
  if (currentUser === 'customer') {
    navigate('/');
    return null;
  }

  const requestedOrders = orders.filter((order) => order.status === 'requested');

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
                    <span className="px-2 py-1 text-sm text-white rounded-full bg-kitchen-500">
                      New
                    </span>
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
                  <ul className="mb-4 space-y-1">
                    {order.products.map((product) => (
                      <li key={product.id} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span>{product.name}</span>
                        <span className="font-medium">×{product.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View Request Details
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
