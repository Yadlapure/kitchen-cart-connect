
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { FaRupeeSign, FaChartLine, FaUsers, FaStore } from 'react-icons/fa';

const AdminDashboard = () => {
  const { orders, merchants } = useApp();
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const commissionRate = 0.05; // 5% commission

  useEffect(() => {
    const completedOrders = orders.filter(order => order.status === 'completed');
    setTotalOrders(completedOrders.length);
    
    let commission = 0;
    const transactions: any[] = [];
    
    completedOrders.forEach(order => {
      const orderTotal = order.total || 0;
      const orderCommission = orderTotal * commissionRate;
      commission += orderCommission;
      
      transactions.push({
        orderId: order.id,
        merchantId: order.merchantId,
        orderTotal,
        commission: orderCommission,
        date: order.updatedAt
      });
    });
    
    setTotalCommission(commission);
    setRecentTransactions(transactions.slice(-10).reverse());
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Commission</p>
                  <p className="text-2xl font-bold text-kitchen-600">₹{totalCommission.toFixed(2)}</p>
                </div>
                <FaRupeeSign className="h-8 w-8 text-kitchen-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
                <FaChartLine className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Merchants</p>
                  <p className="text-2xl font-bold">{merchants.length}</p>
                </div>
                <FaStore className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Commission Rate</p>
                  <p className="text-2xl font-bold">{(commissionRate * 100).toFixed(1)}%</p>
                </div>
                <FaUsers className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Commission Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Order ID</th>
                      <th className="text-left p-2">Merchant</th>
                      <th className="text-left p-2">Order Total</th>
                      <th className="text-left p-2">Commission</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction, index) => {
                      const merchant = merchants.find(m => m.id === transaction.merchantId);
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono text-xs">{transaction.orderId}</td>
                          <td className="p-2">{merchant?.name || 'Unknown'}</td>
                          <td className="p-2">₹{transaction.orderTotal.toFixed(2)}</td>
                          <td className="p-2 text-kitchen-600 font-semibold">₹{transaction.commission.toFixed(2)}</td>
                          <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No completed orders yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
