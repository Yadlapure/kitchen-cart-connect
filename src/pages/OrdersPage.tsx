
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useAppSelector } from "@/hooks/redux";
import { useNavigate } from "react-router-dom";

const OrdersPage = () => {
  const { orders } = useAppSelector((state) => state.app);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();

  const activeOrders = orders.filter((order) => 
    ["requested", "quoted", "confirmed", "processing", "delivering"].includes(order.status)
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const completedOrders = orders.filter((order) => 
    order.status === "completed"
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const filteredOrders = activeTab === "active" ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">
                    {activeTab === "active" 
                      ? "No active orders at the moment" 
                      : "No completed orders yet"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md cursor-pointer">
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
                          <p className="text-sm font-medium text-gray-500">Payment Method</p>
                          <p>{order.paymentMethod || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total</p>
                          <p>{order.total ? `₹${order.total.toFixed(2)}` : 'Pending quote'}</p>
                        </div>
                      </div>
                      
                      {order.estimatedDeliveryTime && (
                        <div className="px-4 py-2 mt-4 bg-blue-50 border border-blue-100 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Estimated delivery:</span> {order.estimatedDeliveryTime}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 text-right">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="px-4 py-2 text-white rounded-md bg-kitchen-500 hover:bg-kitchen-600"
                        >
                          View Details
                        </button>
                      </div>
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
