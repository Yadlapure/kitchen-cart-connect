
import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import FirstTimeAddressSetup from './FirstTimeAddressSetup';
import LocationSelector from './LocationSelector';

const LocationSetupHandler = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [showAddressSetup, setShowAddressSetup] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const handleLocationSelect = (location: string) => {
    // Check if user is customer and has no addresses
    if (user?.role === 'customer' && (!user?.addresses || user.addresses.length === 0)) {
      setShowAddressSetup(true);
    }
    setShowLocationSelector(false);
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
      <div 
        onClick={handleOpenLocationSelector}
        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
      >
        <span className="text-gray-600">📍</span>
        <div>
          <div className="font-medium">
            {user?.selectedLocation || 'Select Location'}
          </div>
          <div className="text-sm text-gray-500">Choose your delivery area</div>
        </div>
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
