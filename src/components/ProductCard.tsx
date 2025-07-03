
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/store/appSlice";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart, updateQuantity, removeFromCart } from "@/store/appSlice";
import { FaTrash } from 'react-icons/fa';

interface ProductCardProps {
  product: Product;
  editable?: boolean;
  isOrderView?: boolean;
  showPrice?: boolean;
}

const ProductCard = ({ product, editable = true, isOrderView = false, showPrice = true }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(product.quantity || 1);
  const [unit, setUnit] = useState(product.unit);
  const [name, setName] = useState(product.name);

  // Ensure quantity and unit state stays in sync with product props
  useEffect(() => {
    setQuantity(product.quantity || 1);
    setUnit(product.unit);
  }, [product.quantity, product.unit]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      ...product,
      quantity,
      unit
    }));
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (!editable) {
      dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (!editable) {
        dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
      }
    }
  };

  const handleQuantityChange = () => {
    // Update both quantity and unit when in cart editing mode
    const updatedProduct = {
      ...product,
      quantity,
      unit
    };
    
    // Remove the old product and add the updated one
    dispatch(removeFromCart(product.id));
    dispatch(addToCart(updatedProduct));
  };

  const handleRemoveItem = () => {
    dispatch(removeFromCart(product.id));
  };

  const unitOptions = [
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram' },
    { value: 'liter', label: 'Liter' },
    { value: 'number', label: 'Number' }
  ];

  return (
    <Card className={`border ${isOrderView && product.updatedPrice ? 'border-kitchen-500' : ''}`}>
      <CardContent className="p-4">
        <div>
          {editable && !isOrderView ? (
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-lg font-medium"
                placeholder="Product name"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveItem}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <FaTrash size={18} />
              </Button>
            </div>
          ) : (
            <h3 className="mb-2 text-lg font-medium">{product.name}</h3>
          )}
          
          {product.description && (
            <p className="mb-3 text-sm text-gray-500">{product.description}</p>
          )}
          
          {showPrice && (
            <div className="flex items-center justify-between mb-3">
              {isOrderView && product.updatedPrice ? (
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-kitchen-600">
                    ₹{product.updatedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {product.price ? `₹${product.price.toFixed(2)}` : ''}
                  </span>
                </div>
              ) : product.price ? (
                <span className="text-lg font-semibold">₹{product.price.toFixed(2)}</span>
              ) : (
                <span className="text-sm italic text-gray-500">Price to be quoted</span>
              )}
              
              {isOrderView && product.isAvailable === false && (
                <span className="px-2 py-1 text-xs text-white bg-red-500 rounded-md">
                  Unavailable
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Quantity Controls */}
              <div className="flex items-center border rounded">
                <button 
                  onClick={decrementQuantity}
                  className="px-3 py-1 text-gray-600 border-r hover:bg-gray-100"
                  type="button"
                >
                  -
                </button>
                <span className="px-3 py-1">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  className="px-3 py-1 text-gray-600 border-l hover:bg-gray-100"
                  type="button"
                >
                  +
                </button>
              </div>
              
              {/* Unit Selector - Show when editable and not in order view */}
              {editable && !isOrderView && (
                <Select value={unit} onValueChange={(value) => setUnit(value as any)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Show unit as text when not editable */}
              {(!editable || isOrderView) && (
                <span className="text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
                  {unitOptions.find(opt => opt.value === unit)?.label || unit}
                </span>
              )}
            </div>
            
            {editable && !isOrderView ? (
              <Button 
                onClick={handleQuantityChange} 
                variant="secondary"
                className="text-white bg-kitchen-500 hover:bg-kitchen-600"
              >
                Update
              </Button>
            ) : editable && (
              <Button 
                onClick={handleAddToCart} 
                variant="secondary"
                className="text-white bg-kitchen-500 hover:bg-kitchen-600"
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
