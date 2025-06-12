
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import ProductRequestForm from "@/components/ProductRequestForm";
import ProductCard from "@/components/ProductCard";
import MerchantCard from "@/components/MerchantCard";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { addToCart, clearCart, setSelectedMerchant, addOrder } from "@/store/appSlice";
import { Product, Merchant } from "@/store/appSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RequestPage = () => {
  const { cart, merchants, selectedMerchant } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'add-products' | 'select-merchant' | 'review'>('add-products');

  const handleAddProduct = (product: Product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to your request`);
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    dispatch(setSelectedMerchant(merchant));
    setStep('review');
  };

  const handleSubmitRequest = () => {
    if (!selectedMerchant || cart.length === 0) {
      toast.error("Please add items and select a merchant");
      return;
    }

    const newOrder = {
      id: `order-${Date.now()}`,
      merchantId: selectedMerchant.id,
      products: [...cart],
      status: 'requested' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());
    dispatch(setSelectedMerchant(null));
    
    toast.success("Request submitted successfully!");
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
            step === 'select-merchant' ? 'border-kitchen-500 bg-kitchen-50' : 'border-gray-200'
          }`}>
            <h3 className="font-medium">2. Select Merchant</h3>
            <p className="text-sm text-gray-600">Choose a merchant to fulfill your request</p>
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

            {step === 'select-merchant' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Select a Merchant</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {merchants.map((merchant) => (
                    <MerchantCard 
                      key={merchant.id}
                      merchant={merchant}
                      onSelect={handleMerchantSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Merchant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMerchant && (
                      <div className="flex items-center space-x-4">
                        <img 
                          src={selectedMerchant.image} 
                          alt={selectedMerchant.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{selectedMerchant.name}</h3>
                          <p className="text-sm text-gray-600">
                            ⭐ {selectedMerchant.rating} • {selectedMerchant.deliveryTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedMerchant.categories.join(', ')}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setStep('select-merchant')}
                        >
                          Change
                        </Button>
                      </div>
                    )}
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
                            {product.price && (
                              <p className="text-sm text-gray-500">Expected: ₹{product.price}</p>
                            )}
                          </div>
                          <span className="font-medium">×{product.quantity}</span>
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
                  <span>Merchant selected:</span>
                  <span className="font-medium">
                    {selectedMerchant ? '✓' : '✗'}
                  </span>
                </div>

                <div className="space-y-2">
                  {step === 'add-products' && cart.length > 0 && (
                    <Button 
                      onClick={() => setStep('select-merchant')}
                      className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                    >
                      Continue to Merchant Selection
                    </Button>
                  )}
                  
                  {step === 'select-merchant' && (
                    <Button 
                      variant="outline"
                      onClick={() => setStep('add-products')}
                      className="w-full"
                    >
                      Back to Add Items
                    </Button>
                  )}
                  
                  {step === 'review' && (
                    <>
                      <Button 
                        onClick={handleSubmitRequest}
                        className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                        disabled={cart.length === 0 || !selectedMerchant}
                      >
                        Submit Request
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setStep('select-merchant')}
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
