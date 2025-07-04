
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { Product, DefaultItem, addToCart, removeFromCart, updateQuantity } from "@/store/appSlice";

const DefaultItemSelector = () => {
  const { defaultItems, cart } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [itemUnits, setItemUnits] = useState<Record<string, string>>({});

  const categories = Array.from(new Set(defaultItems.map(item => item.category)));
  
  const filteredItems = selectedCategory === "all" 
    ? defaultItems 
    : defaultItems.filter(item => item.category === selectedCategory);

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id.startsWith(itemId));
    return cartItem?.quantity || 0;
  };

  const getItemUnit = (itemId: string, defaultUnit: string) => {
    return itemUnits[itemId] || defaultUnit;
  };

  const incrementQuantity = (item: DefaultItem) => {
    const currentUnit = getItemUnit(item.id, item.commonUnits[0]);
    const existingCartItem = cart.find(cartItem => cartItem.id.startsWith(item.id));
    
    if (existingCartItem) {
      dispatch(updateQuantity({ 
        productId: existingCartItem.id, 
        quantity: existingCartItem.quantity + 1 
      }));
    } else {
      const newProduct: Product = {
        id: `${item.id}-${Date.now()}-${Math.random()}`,
        name: item.name,
        quantity: 1,
        unit: currentUnit as 'gram' | 'kg' | 'number' | 'liter' | 'piece',
      };
      dispatch(addToCart(newProduct));
    }
  };

  const decrementQuantity = (item: DefaultItem) => {
    const existingCartItem = cart.find(cartItem => cartItem.id.startsWith(item.id));
    
    if (existingCartItem) {
      if (existingCartItem.quantity > 1) {
        dispatch(updateQuantity({ 
          productId: existingCartItem.id, 
          quantity: existingCartItem.quantity - 1 
        }));
      } else {
        dispatch(removeFromCart(existingCartItem.id));
      }
    }
  };

  const handleUnitChange = (itemId: string, unit: string) => {
    setItemUnits(prev => ({
      ...prev,
      [itemId]: unit
    }));
    
    // Update existing cart item unit if it exists
    const existingCartItem = cart.find(cartItem => cartItem.id.startsWith(itemId));
    if (existingCartItem) {
      dispatch(updateQuantity({ 
        productId: existingCartItem.id, 
        quantity: existingCartItem.quantity 
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose from Common Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            const unit = getItemUnit(item.id, item.commonUnits[0]);
            
            return (
              <div key={item.id} className="border rounded-lg p-4 flex items-center space-x-3">
                {/* Item Image */}
                <img 
                  src={item.image || '/placeholder.svg'} 
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  
                  {/* Unit Selection */}
                  {item.commonUnits.length > 1 && (
                    <div className="mt-1">
                      <Select 
                        value={unit} 
                        onValueChange={(value) => handleUnitChange(item.id, value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {item.commonUnits.map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {item.commonUnits.length === 1 && (
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">{item.commonUnits[0]}</Badge>
                    </div>
                  )}
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  {quantity === 0 ? (
                    <button
                      onClick={() => incrementQuantity(item)}
                      className="h-8 w-8 p-0 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decrementQuantity(item)}
                        className="h-8 w-8 p-0 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium min-w-[20px] text-center">{quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item)}
                        className="h-8 w-8 p-0 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DefaultItemSelector;
