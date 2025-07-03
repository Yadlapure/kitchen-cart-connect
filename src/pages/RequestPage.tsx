
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import DefaultItemSelector from "@/components/DefaultItemSelector";
import ProductRequestForm from "@/components/ProductRequestForm";
import ProductCard from "@/components/ProductCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { addToCart, clearCart, addSelectedMerchant, removeSelectedMerchant, clearSelectedMerchants, addOrder } from "@/store/appSlice";
import { Product, Merchant } from "@/store/appSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

const RequestPage = () => {
  const { cart, merchants, selectedMerchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'add-products' | 'view-cart' | 'select-merchants' | 'review'>('add-products');
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
    setStep('view-cart');
  };

  const handleProceedToMerchants = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent('/request'));
      return;
    }
    setStep('select-merchants');
  };

  const handleMerchantToggle = (merchantId: string, checked: boolean) => {
    if (checked) {
      dispatch(addSelectedMerchant(merchantId));
    } else {
      dispatch(removeSelectedMerchant(merchantId));
    }
  };

  const handleSubmitRequest = () => {
    if (selectedMerchants.length === 0 || cart.length === 0 || !user) {
      toast.error("Please add items and select at least one merchant");
      return;
    }

    const newOrder = {
      id: `order-${Date.now()}`,
      customerId: user.id,
      selectedMerchants: [...selectedMerchants],
      merchantQuotes: [],
      products: [...cart],
      status: 'requested' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());
    dispatch(clearSelectedMerchants());
    
    toast.success("Request sent to selected merchants!");
    navigate('/orders');
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
            Cart
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-kitchen-500">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex mb-8 space-x-2 overflow-x-auto">
          <div className={`flex-1 min-w-[200px] p-3 rounded-lg border-2 ${
            step === 'add-products' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">1. Add Items</h3>
            <p className="text-sm text-gray-600">Build your shopping list</p>
          </div>
          <div className={`flex-1 min-w-[200px] p-3 rounded-lg border-2 ${
            step === 'view-cart' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">2. Review Cart</h3>
            <p className="text-sm text-gray-600">Check your items</p>
          </div>
          <div className={`flex-1 min-w-[200px] p-3 rounded-lg border-2 ${
            step === 'select-merchants' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">3. Select Merchants</h3>
            <p className="text-sm text-gray-600">Choose who to quote</p>
          </div>
          <div className={`flex-1 min-w-[200px] p-3 rounded-lg border-2 ${
            step === 'review' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">4. Send Request</h3>
            <p className="text-sm text-gray-600">Submit to merchants</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'add-products' && (
              <div className="space-y-6">
                <Tabs defaultValue="common-items" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="common-items">Choose from Common Items</TabsTrigger>
                    <TabsTrigger value="custom-item">Add Custom Item</TabsTrigger>
                  </TabsList>
                  <TabsContent value="common-items">
                    <DefaultItemSelector onAddItem={handleAddProduct} />
                  </TabsContent>
                  <TabsContent value="custom-item">
                    <ProductRequestForm onAdd={handleAddProduct} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {step === 'view-cart' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Your Cart ({totalItems} items)</h2>
                  <Button
                    variant="outline"
                    onClick={() => setStep('add-products')}
                  >
                    Add More Items
                  </Button>
                </div>
                
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        editable={false}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="mb-4 text-gray-500">Your cart is empty</p>
                      <Button
                        onClick={() => setStep('add-products')}
                        className="bg-kitchen-500 hover:bg-kitchen-600"
                      >
                        Add Items
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 'select-merchants' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Select Merchants</h2>
                <p className="text-gray-600">Choose multiple merchants to get competitive quotes for your items.</p>
                
                <div className="space-y-4">
                  {merchants.map((merchant) => (
                    <Card key={merchant.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedMerchants.includes(merchant.id)}
                            onCheckedChange={(checked) => handleMerchantToggle(merchant.id, checked as boolean)}
                          />
                          <img 
                            src={merchant.image} 
                            alt={merchant.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{merchant.name}</h3>
                            <p className="text-sm text-gray-600">
                              ⭐ {merchant.rating} • {merchant.deliveryTime}
                            </p>
                            <p className="text-sm text-gray-500">
                              {merchant.categories.join(', ')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Merchants ({selectedMerchants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedMerchants.map(merchantId => {
                        const merchant = merchants.find(m => m.id === merchantId);
                        return merchant ? (
                          <div key={merchant.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <img 
                              src={merchant.image} 
                              alt={merchant.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h4 className="font-medium">{merchant.name}</h4>
                              <p className="text-sm text-gray-600">⭐ {merchant.rating}</p>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setStep('select-merchants')}
                      className="mt-4"
                    >
                      Change Selection
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Request Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cart.map((product) => (
                        <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-600">{product.description}</p>
                            )}
                          </div>
                          <span className="font-medium">{product.quantity} {product.unit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Cart Sidebar with Request Progress */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart & Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Request Progress Section */}
                <div className="space-y-4 pb-4 border-b">
                  <h4 className="font-medium text-gray-900">Request Progress</h4>
                  
                  <div className="flex items-center justify-between">
                    <span>Items in cart:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Merchants selected:</span>
                    <span className="font-medium">{selectedMerchants.length}</span>
                  </div>
                </div>

                {/* Cart Preview */}
                {cart.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Cart Items</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cart.slice(0, 4).map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium text-sm">{product.name}</span>
                          <span className="text-xs text-gray-600">{product.quantity} {product.unit}</span>
                        </div>
                      ))}
                      {cart.length > 4 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{cart.length - 4} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  {step === 'add-products' && (
                    <Button 
                      onClick={handleViewCart}
                      disabled={cart.length === 0}
                      className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                    >
                      View Cart ({totalItems})
                    </Button>
                  )}
                  
                  {step === 'view-cart' && (
                    <>
                      <Button 
                        onClick={handleProceedToMerchants}
                        disabled={cart.length === 0}
                        className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                      >
                        {!user ? "Login to Choose Merchants" : "Choose Merchants"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setStep('add-products')}
                        className="w-full"
                      >
                        Add More Items
                      </Button>
                    </>
                  )}
                  
                  {step === 'select-merchants' && (
                    <>
                      {selectedMerchants.length > 0 && (
                        <Button 
                          onClick={() => setStep('review')}
                          className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                        >
                          Continue to Review
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => setStep('view-cart')}
                        className="w-full"
                      >
                        Back to Cart
                      </Button>
                    </>
                  )}
                  
                  {step === 'review' && (
                    <>
                      <Button 
                        onClick={handleSubmitRequest}
                        className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                        disabled={cart.length === 0 || selectedMerchants.length === 0}
                      >
                        Send Request to Merchants
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setStep('select-merchants')}
                        className="w-full"
                      >
                        Back to Merchant Selection
                      </Button>
                    </>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => dispatch(clearCart())}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      Clear All Items
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestPage;
