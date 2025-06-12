
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import ProductRequestForm from "@/components/ProductRequestForm";
import ProductCard from "@/components/ProductCard";
import { Product, useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { FaSearch } from 'react-icons/fa';

const RequestPage = () => {
  const { cart, addToCart, clearCart, selectedMerchant, merchants, setSelectedMerchant, addOrder } = useApp();
  const [requestItems, setRequestItems] = useState<Product[]>([]);
  const [availableItems, setAvailableItems] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Sample available items - this would typically come from an API
  useEffect(() => {
    const sampleItems: Product[] = [
      { id: "item-1", name: "Kitchen Knife", description: "8-inch stainless steel chef knife", quantity: 1, price: 899 },
      { id: "item-2", name: "Cooking Pot", description: "5L non-stick cooking pot", quantity: 1, price: 1299 },
      { id: "item-3", name: "Mixing Bowl", description: "Large stainless steel mixing bowl", quantity: 1, price: 599 },
      { id: "item-4", name: "Spatula", description: "Silicone spatula for cooking", quantity: 1, price: 249 },
      { id: "item-5", name: "Cutting Board", description: "Wooden cutting board", quantity: 1, price: 499 },
      { id: "item-6", name: "Measuring Cup Set", description: "Set of measuring cups", quantity: 1, price: 399 }
    ];
    setAvailableItems(sampleItems);
  }, []);

  const handleAddItem = (product: Product) => {
    setRequestItems([...requestItems, product]);
  };

  const handleAddAllToCart = () => {
    requestItems.forEach((item) => {
      addToCart(item);
    });
    setRequestItems([]);
    toast.success("All items added to cart");
  };

  const handleSubmitRequest = () => {
    if (cart.length === 0 && requestItems.length === 0) {
      toast.error("Please add items before submitting");
      return;
    }

    // Add any remaining request items to cart
    if (requestItems.length > 0) {
      handleAddAllToCart();
    }

    if (!selectedMerchant) {
      toast.error("Please select a merchant");
      return;
    }

    // Create new order
    const newOrder = {
      id: `order-${Date.now()}`,
      merchantId: selectedMerchant.id,
      products: [...cart],
      status: 'requested' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addOrder(newOrder);
    clearCart();
    toast.success("Request submitted successfully");
    navigate('/orders');
  };

  const filteredAvailableItems = availableItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAvailableItemToCart = (product: Product) => {
    addToCart(product);
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Create Item Request</h1>
        
        <div className="grid gap-6 md:grid-cols-12">
          {/* Form Section */}
          <div className="md:col-span-5">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Merchant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {merchants.map((merchant) => (
                      <div 
                        key={merchant.id} 
                        className={`p-3 border rounded-md cursor-pointer ${
                          selectedMerchant?.id === merchant.id ? 'border-kitchen-500 bg-kitchen-50' : ''
                        }`}
                        onClick={() => setSelectedMerchant(merchant)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{merchant.name}</span>
                          <span className="text-sm text-gray-500">{merchant.deliveryTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Available Items Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Available Items</CardTitle>
                <div className="relative mt-2">
                  <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {filteredAvailableItems.length > 0 ? (
                    filteredAvailableItems.map((item) => (
                      <div key={item.id} className="p-2 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <p className="text-sm font-semibold">₹{item.price?.toFixed(2)}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAddAvailableItemToCart(item)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items match your search</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <ProductRequestForm onAdd={handleAddItem} />
            
            {requestItems.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Pending Items ({requestItems.length})</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddAllToCart}
                  >
                    Add All to Cart
                  </Button>
                </div>
                <div className="space-y-2">
                  {requestItems.map((item) => (
                    <div key={item.id} className="p-2 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{item.name} (×{item.quantity})</span>
                          {item.price && <span className="text-sm text-gray-500 ml-2">₹{item.price}</span>}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            addToCart(item);
                            setRequestItems(requestItems.filter(i => i.id !== item.id));
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Cart Section */}
          <div className="md:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Request Cart ({cart.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>Your request cart is empty</p>
                    <p className="mt-2 text-sm">Add items using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <ProductCard key={item.id} product={item} editable={true} />
                    ))}
                    
                    <div className="mt-6">
                      <Button 
                        className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
                        onClick={handleSubmitRequest}
                        disabled={cart.length === 0 && requestItems.length === 0}
                      >
                        Submit Request
                      </Button>
                      <p className="mt-2 text-sm text-center text-gray-500">
                        Your request will be sent to the merchant for a quote
                      </p>
                    </div>
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
