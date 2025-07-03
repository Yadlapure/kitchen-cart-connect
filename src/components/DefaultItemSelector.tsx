
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/redux";
import { Product, DefaultItem } from "@/store/appSlice";

interface DefaultItemSelectorProps {
  onAddItem: (product: Product) => void;
}

const DefaultItemSelector = ({ onAddItem }: DefaultItemSelectorProps) => {
  const { defaultItems } = useAppSelector((state) => state.app);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<DefaultItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<'gram' | 'kg' | 'number' | 'liter' | 'piece'>('piece');
  const [expectedPrice, setExpectedPrice] = useState("");

  const categories = Array.from(new Set(defaultItems.map(item => item.category)));
  
  const filteredItems = selectedCategory === "all" 
    ? defaultItems 
    : defaultItems.filter(item => item.category === selectedCategory);

  const handleItemSelect = (item: DefaultItem) => {
    setSelectedItem(item);
    setUnit(item.commonUnits[0]);
    setQuantity(item.suggestedQuantity || 1);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const newProduct: Product = {
      id: `${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      quantity,
      unit,
      price: expectedPrice ? parseFloat(expectedPrice) : undefined,
    };

    onAddItem(newProduct);
    
    // Reset selection
    setSelectedItem(null);
    setQuantity(1);
    setUnit('piece');
    setExpectedPrice("");
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
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {filteredItems.map((item) => (
            <Button
              key={item.id}
              variant={selectedItem?.id === item.id ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-start"
              onClick={() => handleItemSelect(item)}
            >
              <span className="font-medium">{item.name}</span>
              <div className="flex gap-1 mt-1">
                {item.commonUnits.map(u => (
                  <Badge key={u} variant="secondary" className="text-xs">{u}</Badge>
                ))}
              </div>
            </Button>
          ))}
        </div>

        {/* Selected Item Configuration */}
        {selectedItem && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Configure: {selectedItem.name}</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <Select value={unit} onValueChange={(value) => setUnit(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedItem.commonUnits.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Expected Price (Optional)</label>
              <Input
                type="number"
                step="0.01"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder="Enter expected price"
              />
            </div>
            
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-kitchen-500 hover:bg-kitchen-600"
            >
              Add to Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefaultItemSelector;
