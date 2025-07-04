
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { addSelectedMerchant, removeSelectedMerchant, clearSelectedMerchants, addOrder } from "@/store/appSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Store, MapPin, Star } from "lucide-react";

const MerchantsPage = () => {
  const { cart, selectedMerchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Mock merchants data
  const merchants = [
    {
      id: "1",
      name: "Fresh Mart",
      address: "123 Main St, City",
      rating: 4.5,
      deliveryTime: "30-45 min",
      image: "/placeholder.svg"
    },
    {
      id: "2", 
      name: "Green Grocery",
      address: "456 Oak Ave, City",
      rating: 4.2,
      deliveryTime: "25-40 min",
      image: "/placeholder.svg"
    },
    {
      id: "3",
      name: "Quick Market",
      address: "789 Pine Rd, City", 
      rating: 4.7,
      deliveryTime: "20-35 min",
      image: "/placeholder.svg"
    }
  ];

  const handleMerchantSelect = (merchantId: string) => {
    if (selectedMerchants.includes(merchantId)) {
      dispatch(removeSelectedMerchant(merchantId));
    } else {
      dispatch(addSelectedMerchant(merchantId));
    }
  };

  const handleProceedToOrder = () => {
    if (selectedMerchants.length === 0) {
      toast.error("Please select at least one merchant");
      return;
    }
    
    // Create order logic here
    toast.success("Order placed successfully!");
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Choose Merchants</h1>
          
          {/* Cart Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Items ({cart.reduce((total, item) => total + item.quantity, 0)})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Merchants List */}
          <div className="space-y-4 mb-6">
            {merchants.map((merchant) => (
              <Card 
                key={merchant.id} 
                className={`cursor-pointer transition-all ${
                  selectedMerchants.includes(merchant.id) 
                    ? 'ring-2 ring-kitchen-500 bg-kitchen-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleMerchantSelect(merchant.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={merchant.image} 
                      alt={merchant.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{merchant.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{merchant.address}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{merchant.rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">{merchant.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedMerchants.includes(merchant.id)}
                        onChange={() => handleMerchantSelect(merchant.id)}
                        className="w-5 h-5 text-kitchen-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/request')}
              className="flex-1"
            >
              Back to Cart
            </Button>
            <Button 
              onClick={handleProceedToOrder}
              className="bg-kitchen-500 hover:bg-kitchen-600 flex-1"
              disabled={selectedMerchants.length === 0}
            >
              Place Order ({selectedMerchants.length} merchants)
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantsPage;
