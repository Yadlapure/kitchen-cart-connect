
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import { Product, DefaultItem } from "@/store/appSlice";

interface DefaultItemSelectorProps {
  onAddItem: (product: Product) => void;
}

const DefaultItemSelector = ({ onAddItem }: DefaultItemSelectorProps) => {
  const { defaultItems } = useAppSelector((state) => state.app);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [itemQuantities, setItemQuantities] = useState<Record<string, { quantity: number; unit: string }>>({});

  const categories = Array.from(new Set(defaultItems.map(item => item.category)));
  
  const filteredItems = selectedCategory === "all" 
    ? defaultItems 
    : defaultItems.filter(item => item.category === selectedCategory);

  const getItemQuantity = (itemId: string) => {
    return itemQuantities[itemId]?.quantity || 0;
  };

  const getItemUnit = (itemId: string, defaultUnit: string) => {
    return itemQuantities[itemId]?.unit || defaultUnit;
  };

  const incrementQuantity = (item: DefaultItem) => {
    const currentQuantity = getItemQuantity(item.id);
    const currentUnit = getItemUnit(item.id, item.commonUnits[0]);
    
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: {
        quantity: currentQuantity + 1,
        unit: currentUnit
      }
    }));
  };

  const decrementQuantity = (item: DefaultItem) => {
    const currentQuantity = getItemQuantity(item.id);
    if (currentQuantity > 0) {
      setItemQuantities(prev => ({
        ...prev,
        [item.id]: {
          quantity: currentQuantity - 1,
          unit: getItemUnit(item.id, item.commonUnits[0])
        }
      }));
    }
  };

  const handleUnitChange = (itemId: string, unit: string) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: {
        quantity: prev[itemId]?.quantity || 0,
        unit: unit
      }
    }));
  };

  const handleAddToRequest = () => {
    const itemsToAdd: Product[] = [];
    
    Object.entries(itemQuantities).forEach(([itemId, { quantity, unit }]) => {
      if (quantity > 0) {
        const item = defaultItems.find(i => i.id === itemId);
        if (item) {
          itemsToAdd.push({
            id: `${itemId}-${Date.now()}-${Math.random()}`,
            name: item.name,
            quantity,
            unit: unit as 'gram' | 'kg' | 'number' | 'liter' | 'piece',
          });
        }
      }
    });

    itemsToAdd.forEach(product => onAddItem(product));
    
    // Reset quantities after adding
    setItemQuantities({});
  };

  const totalSelectedItems = Object.values(itemQuantities).reduce((total, { quantity }) => total + quantity, 0);

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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => incrementQuantity(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decrementQuantity(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium min-w-[20px] text-center">{quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => incrementQuantity(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add to Request Button */}
        {totalSelectedItems > 0 && (
          <div className="border-t pt-4">
            <Button 
              onClick={handleAddToRequest}
              className="w-full bg-kitchen-500 hover:bg-kitchen-600"
            >
              Add {totalSelectedItems} Item{totalSelectedItems > 1 ? 's' : ''} to Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefaultItemSelector;
