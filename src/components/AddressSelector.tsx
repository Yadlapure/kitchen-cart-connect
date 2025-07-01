
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Edit, Plus, Home, Building } from 'lucide-react';
import AddressForm from './AddressForm';

interface AddressSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: any) => void;
  selectedAddressId?: string;
}

const AddressSelector = ({ isOpen, onClose, onAddressSelect, selectedAddressId }: AddressSelectorProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const handleAddressSelect = (address: any) => {
    onAddressSelect(address);
    onClose();
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleAddressFormSave = (address: any) => {
    setShowAddressForm(false);
    setEditingAddress(null);
    // Auto-select the new/edited address
    onAddressSelect(address);
    onClose();
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  if (showAddressForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            editingAddress={editingAddress}
            onSave={handleAddressFormSave}
            onCancel={() => setShowAddressForm(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Delivery Address</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {user?.addresses && user.addresses.length > 0 ? (
            <>
              {user.addresses.map((address) => (
                <Card 
                  key={address.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedAddressId === address.id ? 'ring-2 ring-kitchen-500' : ''
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getAddressIcon(address.type)}
                          <span className="font-medium capitalize text-kitchen-600">
                            {address.type}
                          </span>
                          {address.isDefault && (
                            <span className="bg-kitchen-100 text-kitchen-600 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{address.fullAddress}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(address);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="outline"
                onClick={handleAddNew}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No saved addresses</p>
              <Button onClick={handleAddNew} className="bg-kitchen-500 hover:bg-kitchen-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressSelector;
