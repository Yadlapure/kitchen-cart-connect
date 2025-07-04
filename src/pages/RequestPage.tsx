
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import DefaultItemSelector from "@/components/DefaultItemSelector";
import ProductRequestForm from "@/components/ProductRequestForm";
import ProductCard from "@/components/ProductCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { addToCart, clearCart, addSelectedMerchant, removeSelectedMerchant, clearSelectedMerchants, addOrder } from "@/store/appSlice";
import { Product } from "@/store/appSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

const RequestPage = () => {
  const { cart, user } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);

  const handleAddProduct = (product: Product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to your cart`);
  };

  const handleViewCart = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Add some items first!");
      return;
    }
    setShowCart(true);
  };

  const handleProceedToMerchants = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/request'));
      return;
    }
    // Navigate to merchant selection logic here
    navigate('/merchants');
  };

  const totalItems = cart.reduce((total, product) => total + product.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Build Your Request</h1>
          
          {/* Cart Button */}
          <Button
            onClick={handleViewCart}
            variant="outline"
            className="relative"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart ({totalItems})
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!showCart ? (
            <div className="space-y-6">
              <Tabs defaultValue="common-items" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="common-items">Choose from Common Items</TabsTrigger>
                  <TabsTrigger value="custom-item">Add Custom Item</TabsTrigger>
                </TabsList>
                <TabsContent value="common-items">
                  <DefaultItemSelector />
                </TabsContent>
                <TabsContent value="custom-item">
                  <ProductRequestForm onAdd={handleAddProduct} />
                </TabsContent>
              </Tabs>

              {/* Bottom Action Buttons */}
              {cart.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 border">
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleViewCart}
                    >
                      Add More Items
                    </Button>
                    <Button 
                      onClick={handleProceedToMerchants}
                      className="bg-kitchen-500 hover:bg-kitchen-600"
                    >
                      {!user ? "Login to Choose Merchants" : "Choose Merchants"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Cart ({totalItems} items)</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </Button>
              </div>
              
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      editable={false}
                      showEditOptions={true}
                    />
                  ))}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => dispatch(clearCart())}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear All Items
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4 text-gray-500">Your cart is empty</p>
                    <Button
                      onClick={() => setShowCart(false)}
                      className="bg-kitchen-500 hover:bg-kitchen-600"
                    >
                      Add Items
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestPage;
