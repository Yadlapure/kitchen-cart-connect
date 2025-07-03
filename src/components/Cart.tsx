
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { removeFromCart, updateQuantity } from '@/store/appSlice';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const Cart = ({ currentStep, setCurrentStep }: CartProps) => {
  const { cart } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const handleProceed = () => {
    setCurrentStep(2);
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Cart</span>
          <span className="text-sm font-normal text-gray-600">
            {getTotalItems()} items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b pb-2">
            <div className="flex-1">
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-gray-600">
                {item.price ? `₹${item.price}` : 'Price not set'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-sm min-w-[2rem] text-center">
                {item.quantity} {item.unit}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total:</span>
            <span className="font-bold">₹{getTotalPrice().toFixed(2)}</span>
          </div>
          <Button onClick={handleProceed} className="w-full">
            Proceed to Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;
