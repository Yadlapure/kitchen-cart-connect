
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { completeFirstTimeSetup } from '@/store/authSlice';
import AddressForm from './AddressForm';

const FirstTimeAddressSetup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleAddressSave = () => {
    dispatch(completeFirstTimeSetup());
    navigate('/');
  };

  // Only show if user is customer and has no saved addresses
  const shouldShow = user?.role === 'customer' && (!user?.addresses || user.addresses.length === 0);

  if (!shouldShow) {
    return null;
  }

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Welcome to KitchenCart Connect!</DialogTitle>
          <p className="text-gray-600">
            Please complete your profile by adding your delivery address to get started.
          </p>
        </DialogHeader>
        <AddressForm
          isFirstTime={true}
          selectedLocation={user?.selectedLocation}
          onSave={handleAddressSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeAddressSetup;
