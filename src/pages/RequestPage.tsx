
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import DefaultItemSelector from "@/components/DefaultItemSelector";
import ProductRequestForm from "@/components/ProductRequestForm";
import ProductCard from "@/components/ProductCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { addToCart, clearCart, addSelectedMerchant, removeSelectedMerchant, clearSelectedMerchants, addOrder } from "@/store/appSlice";
import { Product, Merchant } from "@/store/appSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RequestPage = () => {
  const { cart, merchants, selectedMerchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'add-products' | 'select-merchants' | 'review'>('add-products');

  const handleAddProduct = (product: Product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to your request`);
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
        <h1 className="mb-6 text-2xl font-bold">Request Kitchen Items</h1>
        
        {/* Progress Steps */}
        <div className="flex mb-8 space-x-4">
          <div className={`flex-1 p-3 rounded-lg border-2 ${
            step === 'add-products' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">1. Add Items</h3>
            <p className="text-sm text-gray-600">List the kitchen items you need</p>
          </div>
          <div className={`flex-1 p-3 rounded-lg border-2 ${
            step === 'select-merchants' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">2. Select Merchants</h3>
            <p className="text-sm text-gray-600">Choose merchants to get quotes from</p>
          </div>
          <div className={`flex-1 p-3 rounded-lg border-2 ${
            step === 'review' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">3. Review & Submit</h3>
            <p className="text-sm text-gray-600">Review your request and submit</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'add-products' && (
              <div className="space-y-6">
                <DefaultItemSelector onAddItem={handleAddProduct} />
                <ProductRequestForm onAdd={handleAddProduct} />
                
                {cart.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Request List ({totalItems} items)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {cart.map((product) => (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            editable={false}
                          />
                        ))}
                      </div>
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

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Request Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Items added:</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Merchants selected:</span>
                  <span className="font-medium">{selectedMerchants.length}</span>
                </div>

                <div className="space-y-2">
                  {step === 'add-products' && cart.length > 0 && (
                    <Button 
                      onClick={() => setStep('select-merchants')}
                      className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                    >
                      Continue to Merchant Selection
                    </Button>
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
                        onClick={() => setStep('add-products')}
                        className="w-full"
                      >
                        Back to Add Items
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
