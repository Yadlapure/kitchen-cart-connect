
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { MapPin, Plus, Edit, Trash2, Home, Building, User, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import AddressForm from '@/components/AddressForm';
import { deleteUserAddress, setDefaultAddress } from '@/store/authSlice';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressFormOpen(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      dispatch(deleteUserAddress(addressId));
    }
  };

  const handleSetDefault = (addressId: string) => {
    dispatch(setDefaultAddress(addressId));
  };

  const handleAddressFormSave = () => {
    setIsAddressFormOpen(false);
    setEditingAddress(null);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Addresses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Saved Addresses</span>
                </CardTitle>
                <Button onClick={handleAddAddress} className="bg-kitchen-500 hover:bg-kitchen-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4">
                  {user.addresses.map((address, index) => (
                    <div key={address.id} className="border rounded-lg p-4">
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
                          <p className="text-gray-700 mb-1">{address.fullAddress}</p>
                          {address.instructions && (
                            <p className="text-sm text-gray-500">Instructions: {address.instructions}</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No saved addresses</p>
                  <Button onClick={handleAddAddress} className="bg-kitchen-500 hover:bg-kitchen-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Address Form Dialog */}
      <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            editingAddress={editingAddress}
            onSave={handleAddressFormSave}
            onCancel={() => setIsAddressFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
