
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Home, Plus } from 'lucide-react';
import { saveUserAddress } from '@/store/authSlice';

interface AddressFormProps {
  isFirstTime?: boolean;
  selectedLocation?: string;
  onSave?: (address: any) => void;
  onCancel?: () => void;
  editingAddress?: any;
}

const AddressForm = ({ isFirstTime = false, selectedLocation, onSave, onCancel, editingAddress }: AddressFormProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    type: editingAddress?.type || 'home',
    houseNumber: editingAddress?.houseNumber || '',
    street: editingAddress?.street || '',
    landmark: editingAddress?.landmark || '',
    area: editingAddress?.area || selectedLocation || '',
    city: editingAddress?.city || '',
    pincode: editingAddress?.pincode || '',
    instructions: editingAddress?.instructions || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House number is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const addressData = {
      id: editingAddress?.id || Date.now().toString(),
      ...formData,
      isDefault: editingAddress?.isDefault || true,
      fullAddress: `${formData.houseNumber}, ${formData.street}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.area}, ${formData.city} - ${formData.pincode}`
    };

    dispatch(saveUserAddress(addressData));
    
    if (onSave) {
      onSave(addressData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-kitchen-500" />
          <span>{isFirstTime ? 'Complete Your Address' : editingAddress ? 'Edit Address' : 'Add New Address'}</span>
        </CardTitle>
        {isFirstTime && (
          <p className="text-sm text-gray-600">
            Please provide your complete address for accurate delivery
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Type */}
          <div>
            <Label className="text-sm font-medium">Address Type</Label>
            <div className="flex space-x-2 mt-2">
              {['home', 'work', 'other'].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.type === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className="capitalize"
                >
                  {type === 'home' && <Home className="w-4 h-4 mr-1" />}
                  {type === 'work' && <Plus className="w-4 h-4 mr-1" />}
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* House Number & Street */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="houseNumber">House/Flat Number *</Label>
              <Input
                id="houseNumber"
                value={formData.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                placeholder="e.g., 123, A-45"
                className={errors.houseNumber ? 'border-red-500' : ''}
              />
              {errors.houseNumber && <p className="text-red-500 text-xs mt-1">{errors.houseNumber}</p>}
            </div>
            
            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Street name"
                className={errors.street ? 'border-red-500' : ''}
              />
              {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
            </div>
          </div>

          {/* Landmark & Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                placeholder="Near temple, mall, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="area">Area/Locality *</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="Area name"
                className={errors.area ? 'border-red-500' : ''}
              />
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
            </div>
          </div>

          {/* City & Pincode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City name"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="6 digit pincode"
                maxLength={6}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>

          {/* Delivery Instructions */}
          <div>
            <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              placeholder="Any specific instructions for delivery person"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-kitchen-500 hover:bg-kitchen-600"
            >
              {isFirstTime ? 'Save Address & Continue' : 'Save Address'}
            </Button>
            
            {!isFirstTime && onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
