
import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import FirstTimeAddressSetup from './FirstTimeAddressSetup';
import LocationSelector from './LocationSelector';

const LocationSetupHandler = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [showAddressSetup, setShowAddressSetup] = useState(false);

  const handleLocationSelect = () => {
    // Check if user is customer and has no addresses
    if (user?.role === 'customer' && (!user?.addresses || user.addresses.length === 0)) {
      setShowAddressSetup(true);
    }
  };

  const handleCloseAddressSetup = () => {
    setShowAddressSetup(false);
  };

  return (
    <>
      <LocationSelector onLocationClick={handleLocationSelect} />
      <FirstTimeAddressSetup 
        isOpen={showAddressSetup} 
        onClose={handleCloseAddressSetup} 
      />
    </>
  );
};

export default LocationSetupHandler;
