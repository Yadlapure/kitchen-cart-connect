
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, useApp } from "@/context/AppContext";

interface ProductCardProps {
  product: Product;
  editable?: boolean;
  isOrderView?: boolean;
}

const ProductCard = ({ product, editable = true, isOrderView = false }: ProductCardProps) => {
  const { addToCart, updateQuantity } = useApp();
  const [quantity, setQuantity] = useState(product.quantity || 1);
  const [name, setName] = useState(product.name);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity
    });
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
    if (!editable) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (!editable) {
        updateQuantity(product.id, quantity - 1);
      }
    }
  };

  return (
    <Card className={`border ${isOrderView && product.updatedPrice ? 'border-kitchen-500' : ''}`}>
      <CardContent className="p-4">
        <div>
          {editable ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-2 text-lg font-medium"
              placeholder="Product name"
            />
          ) : (
            <h3 className="mb-2 text-lg font-medium">{product.name}</h3>
          )}
          
          {product.description && (
            <p className="mb-3 text-sm text-gray-500">{product.description}</p>
          )}
          
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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center border rounded">
              <button 
                onClick={decrementQuantity}
                className="px-3 py-1 text-gray-600 border-r hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-3 py-1">{quantity}</span>
              <button 
                onClick={incrementQuantity}
                className="px-3 py-1 text-gray-600 border-l hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            {editable && (
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
