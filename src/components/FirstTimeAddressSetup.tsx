
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { completeFirstTimeSetup } from '@/store/authSlice';
import AddressForm from './AddressForm';

const FirstTimeAddressSetup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isFirstTimeLogin, user } = useAppSelector((state) => state.auth);

  const handleAddressSave = () => {
    dispatch(completeFirstTimeSetup());
    navigate('/');
  };

  if (!isFirstTimeLogin || user?.role !== 'customer') {
    return null;
  }

  return (
    <Dialog open={isFirstTimeLogin} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" hideCloseButton>
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
