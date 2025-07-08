
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import DefaultItemSelector from "@/components/DefaultItemSelector";
import ProductRequestForm from "@/components/ProductRequestForm";
import ProductCard from "@/components/ProductCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { addToCart, clearCart } from "@/store/appSlice";
import { Product } from "@/store/appSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

const RequestPage = () => {
  const { cart } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleAddProduct = (product: Product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to your cart`);
  };

  const handleProceedToMerchants = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/merchants'));
      return;
    }
    navigate('/merchants');
  };

  const totalItems = cart.reduce((total, product) => total + product.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Build Your Request</h1>
          {cart.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Cart: {totalItems} items</span>
              <Button
                onClick={handleProceedToMerchants}
                className="bg-kitchen-500 hover:bg-kitchen-600"
              >
                {!user ? "Login to Choose Merchants" : "Choose Merchants"}
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Add Items */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="common-items" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="common-items">Common Items</TabsTrigger>
                  <TabsTrigger value="custom-item">Custom Items</TabsTrigger>
                </TabsList>
                <TabsContent value="common-items">
                  <DefaultItemSelector />
                </TabsContent>
                <TabsContent value="custom-item">
                  <ProductRequestForm onAdd={handleAddProduct} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Side - Cart */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Your Cart ({totalItems})
                  </h3>
                  
                  {cart.length > 0 ? (
                    <div className="space-y-3">
                      {cart.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          editable={false}
                          showEditOptions={true}
                        />
                      ))}
                      
                      <div className="pt-3 border-t space-y-2">
                        <Button 
                          variant="outline" 
                          onClick={() => dispatch(clearCart())}
                          className="w-full text-red-600 hover:text-red-700"
                          size="sm"
                        >
                          Clear All Items
                        </Button>
                        
                        <Button 
                          onClick={handleProceedToMerchants}
                          className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                        >
                          {!user ? "Login to Proceed" : "Choose Merchants"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 text-sm">Your cart is empty</p>
                      <p className="text-gray-400 text-xs mt-1">Add items to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestPage;
