import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { setSelectedMerchant } from "@/store/appSlice";
import Header from "@/components/Header";
import MerchantCard from "@/components/MerchantCard";

const Index = () => {
  const { merchants } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSelectMerchant = (merchant: typeof merchants[0]) => {
    dispatch(setSelectedMerchant(merchant));
    navigate('/request');
  };

  // If user is not a customer, redirect to appropriate page
  if (user?.role === 'merchant') {
    navigate('/merchant/requests');
    return null;
  }

  if (user?.role === 'admin') {
    navigate('/admin/dashboard');
    return null;
  }

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
              Request kitchen items from local merchants and get them delivered to your doorstep. Simply create your list, choose a merchant, and wait for their quote.
            </p>
            <Button
              className="text-kitchen-600 bg-white hover:bg-gray-100"
              onClick={() => navigate('/request')}
            >
              Start Request
            </Button>
          </div>

          <h2 className="mb-6 text-2xl font-bold">Choose a Merchant</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {merchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onSelect={handleSelectMerchant}
              />
            ))}
          </div>
        </section>

        <section className="py-10">
          <h2 className="mb-6 text-2xl font-bold text-center">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">1</div>
              <h3 className="mb-2 text-lg font-semibold">Create Your Request</h3>
              <p className="text-gray-600">
                Build a list of kitchen items you need. Add details to help merchants find exactly what you're looking for.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">2</div>
              <h3 className="mb-2 text-lg font-semibold">Get a Quote</h3>
              <p className="text-gray-600">
                Merchants review your request and respond with availability and pricing for each item.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">3</div>
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
