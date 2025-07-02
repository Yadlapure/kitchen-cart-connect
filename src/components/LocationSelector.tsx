
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Navigation, X } from "lucide-react";
import { updateSelectedLocation } from "@/store/authSlice";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  currentLocation: string;
}

// Sample Indian cities and popular areas
const popularLocations = [
  { name: "Bangalore", area: "Karnataka", type: "city" },
  { name: "Mumbai", area: "Maharashtra", type: "city" },
  { name: "Delhi", area: "Delhi", type: "city" },
  { name: "Chennai", area: "Tamil Nadu", type: "city" },
  { name: "Hyderabad", area: "Telangana", type: "city" },
  { name: "Pune", area: "Maharashtra", type: "city" },
];

const recentLocations = [
  { name: "Koramangala", area: "Bangalore", type: "area" },
  { name: "Indiranagar", area: "Bangalore", type: "area" },
  { name: "Whitefield", area: "Bangalore", type: "area" },
];

const allLocations = [
  ...popularLocations,
  { name: "Koramangala", area: "Bangalore", type: "area" },
  { name: "Indiranagar", area: "Bangalore", type: "area" },
  { name: "Whitefield", area: "Bangalore", type: "area" },
  { name: "Electronic City", area: "Bangalore", type: "area" },
  { name: "HSR Layout", area: "Bangalore", type: "area" },
  { name: "BTM Layout", area: "Bangalore", type: "area" },
  { name: "Jayanagar", area: "Bangalore", type: "area" },
  { name: "Rajajinagar", area: "Bangalore", type: "area" },
  { name: "Marathahalli", area: "Bangalore", type: "area" },
  { name: "Bellandur", area: "Bangalore", type: "area" },
];

const LocationSelector = ({ isOpen, onClose, onLocationSelect, currentLocation }: LocationSelectorProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(allLocations);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 1) {
      const filtered = allLocations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.area.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(allLocations);
    }
  }, [searchQuery]);

  const handleLocationClick = (locationName: string) => {
    dispatch(updateSelectedLocation({ location: locationName }));
    onLocationSelect(locationName);
    setSearchQuery("");
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd reverse geocode these coordinates
          const locationString = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          dispatch(updateSelectedLocation({ 
            location: locationString, 
            coordinates: { lat: latitude, lng: longitude }
          }));
          onLocationSelect(locationString);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      setIsLoadingLocation(false);
    }
  };

  // Get user's saved locations
  const savedLocations = user?.addresses?.map(addr => ({
    name: addr.area,
    area: addr.city,
    type: 'saved' as const,
    fullAddress: addr.fullAddress
  })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Select Location</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-kitchen-500"
            />
          </div>

          {/* Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            variant="outline"
            className="w-full mb-4 justify-start text-left border-kitchen-200 hover:border-kitchen-300 hover:bg-kitchen-50"
          >
            <Navigation className="w-4 h-4 mr-3 text-kitchen-500" />
            <div className="flex flex-col">
              <span className="font-medium text-kitchen-600">
                {isLoadingLocation ? "Getting current location..." : "Use current location"}
              </span>
              <span className="text-xs text-gray-500">Using GPS</span>
            </div>
          </Button>

          {/* Saved Addresses */}
          {!searchQuery && savedLocations.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Saved Addresses
              </h3>
              {savedLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md"
                  onClick={() => handleLocationClick(location.name)}
                >
                  <MapPin className="w-4 h-4 mr-3 text-kitchen-500" />
                  <div>
                    <div className="font-medium text-gray-800">{location.name}</div>
                    <div className="text-sm text-gray-500">{location.fullAddress}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Locations */}
          {!searchQuery && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Recent Locations
              </h3>
              {recentLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md"
                  onClick={() => handleLocationClick(location.name)}
                >
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-800">{location.name}</div>
                    <div className="text-sm text-gray-500">{location.area}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Popular Cities */}
          {!searchQuery && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Popular Cities
              </h3>
              {popularLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md"
                  onClick={() => handleLocationClick(location.name)}
                >
                  <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-800">{location.name}</div>
                    <div className="text-sm text-gray-500">{location.area}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
                Search Results
              </h3>
              <div className="max-h-60 overflow-y-auto">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-md"
                      onClick={() => handleLocationClick(location.name)}
                    >
                      <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-800">{location.name}</div>
                        <div className="text-sm text-gray-500">{location.area}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No locations found</p>
                    <p className="text-sm">Try searching for a different area</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
