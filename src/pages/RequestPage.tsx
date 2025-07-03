
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from '@/store/appSlice';
import Cart from '@/components/Cart';
import RequestProgress from '@/components/RequestProgress';
import LocationSetupHandler from '@/components/LocationSetupHandler';

const RequestPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<string>('fruits-and-vegetables');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { cart } = useAppSelector((state) => state.app);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Fresh Bananas',
      description: 'Ripe yellow bananas',
      quantity: 1,
      unit: 'kg',
      category: 'fruits-and-vegetables'
    },
    {
      id: '2',
      name: 'Red Apples',
      description: 'Crisp red apples',
      quantity: 1,
      unit: 'kg',
      category: 'fruits-and-vegetables'
    },
    {
      id: '3',
      name: 'Fresh Milk',
      description: 'Whole milk 1L',
      quantity: 1,
      unit: 'liter',
      category: 'dairy-and-bakery'
    },
    {
      id: '4',
      name: 'White Bread',
      description: 'Fresh white bread loaf',
      quantity: 1,
      unit: 'piece',
      category: 'dairy-and-bakery'
    },
    {
      id: '5',
      name: 'Basmati Rice',
      description: 'Premium basmati rice',
      quantity: 1,
      unit: 'kg',
      category: 'staples'
    },
    {
      id: '6',
      name: 'Cooking Oil',
      description: 'Sunflower cooking oil',
      quantity: 1,
      unit: 'liter',
      category: 'staples'
    },
    {
      id: '7',
      name: 'Potato Chips',
      description: 'Crispy potato chips',
      quantity: 1,
      unit: 'piece',
      category: 'snacks-and-beverages'
    },
    {
      id: '8',
      name: 'Cola',
      description: 'Refreshing cola drink',
      quantity: 1,
      unit: 'liter',
      category: 'snacks-and-beverages'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setFilteredProducts(mockProducts.filter(product => product.category === activeTab));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="w-[200px] h-[45px] mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full h-[150px]" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-1/4 h-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Location Selection */}
            <div className="mb-6">
              <LocationSetupHandler />
            </div>

            {/* Product Categories */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
              <TabsList>
                <TabsTrigger value="fruits-and-vegetables">Fruits & Vegetables</TabsTrigger>
                <TabsTrigger value="dairy-and-bakery">Dairy & Bakery</TabsTrigger>
                <TabsTrigger value="staples">Staples</TabsTrigger>
                <TabsTrigger value="snacks-and-beverages">Snacks & Beverages</TabsTrigger>
              </TabsList>
              
              {/* Product Listing */}
              <TabsContent value="fruits-and-vegetables" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} showPrice={false} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="dairy-and-bakery" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} showPrice={false} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="staples" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} showPrice={false} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="snacks-and-beverages" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} showPrice={false} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Cart/Progress Sidebar - Show when cart has items or progress is active */}
          {(cart.length > 0 || currentStep > 1) && (
            <div className="lg:w-96">
              {cart.length > 0 && (
                <Cart currentStep={currentStep} setCurrentStep={setCurrentStep} />
              )}
              {currentStep > 1 && (
                <RequestProgress currentStep={currentStep} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
