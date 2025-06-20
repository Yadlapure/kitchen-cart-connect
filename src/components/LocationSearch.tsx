
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  currentLocation: string | null;
  onGetCurrentLocation: () => void;
  isLoadingLocation: boolean;
}

// Sample Indian cities and villages for demo
const indianLocations = [
  "Bangalore", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Surat",
  "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Indore", "Thane", "Bhopal", "Pimpri-Chinchwad", "Patna",
  "Vadodara", "Ghaziabad", "Ludhiana", "Coimbatore", "Agra", "Madurai", "Nashik", "Faridabad", "Meerut", "Rajkot",
  "Kalyan-Dombivali", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad",
  "Ranchi", "Howrah", "Gwalior", "Jabalpur", "Trichinopoly", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad",
  "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Guntur",
  "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai Nagar", "Cuttack", "Firozabad",
  // Adding some villages
  "Hiware Bazar", "Ralegan Siddhi", "Punsari", "Pothanikkad", "Kokrebellur", "Mawlynnong", "Dharnai", "Ballia",
  "Janwaar", "Lambadi Tanda", "Piplantri", "Saamri", "Kothapally", "Vandanmedu", "Kumbakonam", "Kollegal"
];

const LocationSearch = ({ onLocationSelect, currentLocation, onGetCurrentLocation, isLoadingLocation }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = indianLocations.filter(location =>
        location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered.slice(0, 10)); // Show top 10 matches
      setShowSuggestions(true);
    } else {
      setFilteredLocations([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleLocationClick = (location: string) => {
    setSearchQuery(location);
    onLocationSelect(location);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      onLocationSelect(e.target.value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8 space-y-4">
      <h2 className="text-xl font-semibold text-center">Select Your Location</h2>
      
      {/* Current Location */}
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Use Current Location</span>
          <Button
            onClick={onGetCurrentLocation}
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
      <div className="p-4 bg-white rounded-lg shadow-sm relative">
        <label className="block mb-2 font-medium">Or Search Location</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search for your city or village in India..."
            value={searchQuery}
            onChange={handleInputChange}
            className="pl-10"
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
          />
          
          {/* Location Suggestions */}
          {showSuggestions && filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredLocations.map((location, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{location}</span>
                    <span className="text-sm text-gray-500">India</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {searchQuery && !showSuggestions && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            🔍 Selected: {searchQuery}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearch;
