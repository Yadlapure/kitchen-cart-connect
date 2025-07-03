
import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import FirstTimeAddressSetup from './FirstTimeAddressSetup';
import LocationSelector from './LocationSelector';

const LocationSetupHandler = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showAddressSetup, setShowAddressSetup] = useState(false);

  const handleLocationSelect = (location: string) => {
    setShowLocationSelector(false);
    // Check if user is customer and has no addresses
    if (user?.role === 'customer' && (!user?.addresses || user.addresses.length === 0)) {
      setShowAddressSetup(true);
    }
  };

  const handleCloseAddressSetup = () => {
    setShowAddressSetup(false);
  };

  const handleOpenLocationSelector = () => {
    setShowLocationSelector(true);
  };

  const handleCloseLocationSelector = () => {
    setShowLocationSelector(false);
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={handleOpenLocationSelector}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium">
            {user?.selectedLocation || 'Select Location'}
          </span>
        </button>
      </div>
      
      <LocationSelector 
        isOpen={showLocationSelector}
        onClose={handleCloseLocationSelector}
        onLocationSelect={handleLocationSelect}
        currentLocation={user?.selectedLocation || ''}
      />
      
      <FirstTimeAddressSetup 
        isOpen={showAddressSetup} 
        onClose={handleCloseAddressSetup} 
      />
    </>
  );
};

export default LocationSetupHandler;
