
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

        {/* Items Grid - Swiggy/Zomato Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            const unit = getItemUnit(item.id, item.commonUnits[0]);
            
            return (
              <div key={item.id} className="border rounded-lg p-3 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow">
                {/* Item Image */}
                <img 
                  src={item.image || '/placeholder.svg'} 
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                
                {/* Item Name */}
                <h4 className="font-medium text-sm text-center leading-tight">{item.name}</h4>
                
                {/* Unit Selection */}
                {item.commonUnits.length > 1 && (
                  <Select 
                    value={unit} 
                    onValueChange={(value) => handleUnitChange(item.id, value)}
                  >
                    <SelectTrigger className="h-6 text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {item.commonUnits.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {item.commonUnits.length === 1 && (
                  <Badge variant="secondary" className="text-xs">{item.commonUnits[0]}</Badge>
                )}
                
                {/* Quantity Controls */}
                <div className="flex items-center justify-center w-full">
                  {quantity === 0 ? (
                    <button
                      onClick={() => incrementQuantity(item)}
                      className="h-8 w-full border border-green-500 text-green-500 rounded flex items-center justify-center hover:bg-green-50 font-medium text-sm"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full border border-green-500 rounded">
                      <button
                        onClick={() => decrementQuantity(item)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-green-50 text-green-500"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium text-green-500 text-sm">{quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-green-50 text-green-500"
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
