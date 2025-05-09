
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { orders, merchants } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["requested", "quoted", "confirmed", "processing", "delivering"].includes(order.status);
    if (activeTab === "completed") return order.status === "completed";
    return true;
  }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    return merchant ? merchant.name : "Unknown Merchant";
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md">
                    <CardHeader className="bg-gray-50">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Order #{order.id.split('-')[1]}
                        </CardTitle>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Merchant</p>
                          <p>{getMerchantName(order.merchantId)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date</p>
                          <p>{new Intl.DateTimeFormat('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          }).format(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Items</p>
                          <p>{order.products.reduce((total, product) => total + product.quantity, 0)} items</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {order.status === 'requested' ? 'Awaiting quote' : 
                            order.status === 'quoted' ? 'Quote received' :
                            'Total'}
                          </p>
                          <p>{order.total ? `₹${order.total.toFixed(2)}` : '-'}</p>
                        </div>
                      </div>
                      
                      {order.estimatedDeliveryTime && (
                        <div className="px-4 py-2 mt-4 bg-blue-50 border border-blue-100 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Estimated delivery:</span> {order.estimatedDeliveryTime}
                          </p>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="w-full px-4 py-2 mt-4 text-center text-kitchen-500 transition-colors border border-kitchen-500 rounded-md hover:bg-kitchen-50"
                      >
                        View Details
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OrdersPage;
