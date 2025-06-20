
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/hooks/redux";
import Header from "@/components/Header";
import { MapPin, Search } from "lucide-react";

const Index = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState("");
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // If user is not a customer, redirect to appropriate page
  if (user?.role === 'merchant') {
    navigate('/merchant/requests');
    return null;
  }

  if (user?.role === 'admin') {
    navigate('/admin/dashboard');
    return null;
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd reverse geocode these coordinates
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentLocation("Location access denied");
          setIsLoadingLocation(false);
        }
      );
    } else {
      setCurrentLocation("Geolocation not supported");
      setIsLoadingLocation(false);
    }
  };

  const handleStartRequest = () => {
    if (!currentLocation && !searchLocation) {
      alert("Please select your location first");
      return;
    }
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
              First, let us know your location to find nearby merchants.
            </p>
          </div>

          {/* Location Selection */}
          <div className="max-w-2xl mx-auto mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-center">Select Your Location</h2>
            
            {/* Current Location */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Use Current Location</span>
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  variant="outline"
                  size="sm"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isLoadingLocation ? "Getting..." : "Get Location"}
                </Button>
              </div>
              {currentLocation && (
                <p className="text-sm text-gray-600">📍 {currentLocation}</p>
              )}
            </div>

            {/* Search Location */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <label className="block mb-2 font-medium">Or Search Location</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for your city or village in India..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchLocation && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  🔍 Searching for: {searchLocation}
                </div>
              )}
            </div>

            {/* Start Request Button */}
            <Button
              onClick={handleStartRequest}
              disabled={!currentLocation && !searchLocation}
              className="w-full bg-kitchen-500 hover:bg-kitchen-600 py-3 text-lg"
            >
              {!user ? "Login to Start Request" : "Start Request"}
            </Button>
          </div>
        </section>

        <section className="py-10">
          <h2 className="mb-6 text-2xl font-bold text-center">How It Works</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-white rounded-full bg-kitchen-500">1</div>
              <h3 className="mb-2 text-lg font-semibold">Set Location</h3>
              <p className="text-gray-600">
                Choose your current location or search for your city to find nearby merchants.
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
