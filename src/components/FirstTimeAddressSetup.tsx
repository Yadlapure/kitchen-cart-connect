
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

  // Don't show the modal automatically
  return null;
};

export default FirstTimeAddressSetup;
