
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/redux";
import Header from "@/components/Header";

const Index = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Only redirect if user is merchant/admin (they have their own dashboards)
  if (user?.role === 'merchant') {
    navigate('/merchant/requests');
    return null;
  }

  if (user?.role === 'admin') {
    navigate('/admin/dashboard');
    return null;
  }

  if (user?.role === 'delivery_boy') {
    navigate('/delivery');
    return null;
  }

  const handleStartRequest = () => {
    navigate('/request');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container px-4 py-8 mx-auto sm:px-6">
        <section className="mb-10">
          <div className="p-8 mb-8 text-center rounded-lg kitchen-gradient">
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Your Kitchen Needs, Delivered
            </h1>
            <p className="max-w-2xl mx-auto mb-6 text-white/90">
              Request kitchen items from local merchants and get them delivered to your doorstep. 
              Select your location from the top-left corner to find nearby merchants.
            </p>
            
            {/* Start Request Button */}
            <div className="max-w-md mx-auto">
              <Button
                onClick={handleStartRequest}
                className="w-full bg-white text-kitchen-600 hover:bg-gray-100 py-3 text-lg font-semibold"
              >
                Start Request
              </Button>
            </div>
          </div>
        </section>

        <section className="py-10">
          <h2 className="mb-6 text-2xl font-bold text-center">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">1</div>
              <h3 className="mb-2 text-lg font-semibold">Set Location</h3>
              <p className="text-gray-600">
                Choose your location from the top-left corner to find nearby merchants in your area.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">2</div>
              <h3 className="mb-2 text-lg font-semibold">Add Items to Cart</h3>
              <p className="text-gray-600">
                Build a list of kitchen items you need. Add details to help merchants find exactly what you're looking for.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">3</div>
              <h3 className="mb-2 text-lg font-semibold">Choose Merchants & Get Quote</h3>
              <p className="text-gray-600">
                Select merchants from your area and get competitive quotes for your items.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">4</div>
              <h3 className="mb-2 text-lg font-semibold">Confirm and Receive</h3>
              <p className="text-gray-600">
                Review the quote, choose your payment method, and get your items delivered to your door.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 text-center text-gray-500 bg-white border-t">
        <div className="container px-4 mx-auto">
          <p>© {new Date().getFullYear()} KitchenCart Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
