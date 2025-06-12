
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/store/appSlice";

interface ProductRequestFormProps {
  onAdd: (product: Product) => void;
}

const ProductRequestForm = ({ onAdd }: ProductRequestFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<'gram' | 'kg' | 'number' | 'liter' | 'piece'>('piece');
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newProduct: Product = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim() || undefined,
      quantity,
      unit,
      price: price ? parseFloat(price) : undefined,
    };
    
    onAdd(newProduct);
    
    // Reset form
    setName("");
    setQuantity(1);
    setUnit('piece');
    setDescription("");
    setPrice("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Custom Item</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
              Item Name*
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kitchen Knife, Pressure Cooker"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 8-inch stainless steel, specify brand if needed"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="quantity" className="block mb-1 text-sm font-medium text-gray-700">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block mb-1 text-sm font-medium text-gray-700">
                Unit
              </label>
              <Select value={unit} onValueChange={(value) => setUnit(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="kg">Kilogram (kg)</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="price" className="block mb-1 text-sm font-medium text-gray-700">
              Expected Price (Optional)
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 300"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
          >
            Add Custom Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductRequestForm;
