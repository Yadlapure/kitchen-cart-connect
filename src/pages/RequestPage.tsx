
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux';
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from '@/store/appSlice';
import { useGetProductsQuery, ApiProduct } from '@/store/appApi';
import Cart from '@/components/Cart';
import RequestProgress from '@/components/RequestProgress';
import LocationSetupHandler from '@/components/LocationSetupHandler';

const RequestPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: apiProducts, isLoading, isError } = useGetProductsQuery(user?.id);
  const [activeTab, setActiveTab] = useState<string>('fruits-and-vegetables');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { cart } = useAppSelector((state) => state.app);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (apiProducts) {
      // Convert API products to app products
      const products: Product[] = apiProducts.map((apiProduct: ApiProduct) => ({
        id: apiProduct.id,
        name: apiProduct.name,
        description: apiProduct.description,
        quantity: apiProduct.quantity,
        unit: apiProduct.unit,
        category: apiProduct.category
      }));
      
      setFilteredProducts(products.filter(product => product.category === activeTab));
    }
  }, [apiProducts, activeTab]);

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

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <p className="text-red-500">Error fetching products.</p>
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
