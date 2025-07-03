
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clearCart } from '@/store/appSlice';
import ProductCard from './ProductCard';

interface CartProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const Cart = ({ currentStep, setCurrentStep }: CartProps) => {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.app);

  const handleProceed = () => {
    setCurrentStep(2);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Cart ({cart.length} items)
          <Button variant="outline" size="sm" onClick={handleClearCart}>
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cart.map((item) => (
          <ProductCard 
            key={item.id} 
            product={item} 
            editable={true}
            showPrice={false}
          />
        ))}
        <Button 
          onClick={handleProceed} 
          className="w-full bg-kitchen-500 hover:bg-kitchen-600"
        >
          Proceed to Request
        </Button>
      </CardContent>
    </Card>
  );
};

export default Cart;
