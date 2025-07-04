
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/store/appSlice";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart, updateQuantity, removeFromCart } from "@/store/appSlice";
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { Plus, Minus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  editable?: boolean;
  isOrderView?: boolean;
  showEditOptions?: boolean;
}

const ProductCard = ({ product, editable = true, isOrderView = false, showEditOptions = false }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(product.quantity || 1);
  const [name, setName] = useState(product.name);
  const [unit, setUnit] = useState(product.unit);
  const [isEditing, setIsEditing] = useState(false);

  // Ensure quantity state stays in sync with product props
  useEffect(() => {
    setQuantity(product.quantity || 1);
    setName(product.name);
    setUnit(product.unit);
  }, [product.quantity, product.name, product.unit]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      ...product,
      quantity
    }));
  };

  const incrementQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    if (showEditOptions) {
      dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      if (showEditOptions) {
        dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));
      }
    }
  };

  const handleQuantityChange = () => {
    dispatch(updateQuantity({ productId: product.id, quantity }));
  };

  const handleRemoveItem = () => {
    dispatch(removeFromCart(product.id));
  };

  const handleSaveEdit = () => {
    // Update the product in the cart
    dispatch(updateQuantity({ productId: product.id, quantity }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setQuantity(product.quantity || 1);
    setName(product.name);
    setUnit(product.unit);
    setIsEditing(false);
  };

  const availableUnits: ('gram' | 'kg' | 'number' | 'liter' | 'piece')[] = ['gram', 'kg', 'number', 'liter', 'piece'];

  return (
    <Card className={`border ${isOrderView && product.updatedPrice ? 'border-kitchen-500' : ''}`}>
      <CardContent className="p-4">
        <div>
          {/* Header with name and actions */}
          <div className="flex justify-between items-start mb-2">
            {isEditing ? (
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 mr-2"
                placeholder="Product name"
              />
            ) : (
              <h3 className="text-lg font-medium flex-1">{product.name}</h3>
            )}
            
            <div className="flex space-x-1">
              {showEditOptions && !isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <FaEdit size={14} />
                </Button>
              )}
              
              {isEditing && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSaveEdit}
                    className="text-green-500 hover:text-green-700 hover:bg-green-50"
                  >
                    <FaSave size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <FaTimes size={14} />
                  </Button>
                </>
              )}
              
              {(editable || showEditOptions) && !isOrderView && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRemoveItem}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <FaTrash size={14} />
                </Button>
              )}
            </div>
          </div>
          
          {product.description && (
            <p className="mb-3 text-sm text-gray-500">{product.description}</p>
          )}
          
          {/* Price section */}
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
          
          {/* Unit selector for editing */}
          {isEditing && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Unit</label>
              <Select value={unit} onValueChange={(value) => setUnit(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Quantity controls */}
          <div className="flex items-center justify-between">
            {showEditOptions ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  className="h-8 w-8 p-0"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 min-w-[40px] text-center font-medium">{quantity}</span>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="ml-2 text-sm text-gray-600">{product.unit}</span>
              </div>
            ) : (
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
            )}
            
            {editable && !isOrderView && !showEditOptions && (
              <Button 
                onClick={handleQuantityChange} 
                variant="secondary"
                className="text-white bg-kitchen-500 hover:bg-kitchen-600"
              >
                Update
              </Button>
            )}
            
            {editable && !showEditOptions && !isOrderView && (
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
