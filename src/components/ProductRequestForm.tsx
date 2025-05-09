
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/context/AppContext";

interface ProductRequestFormProps {
  onAdd: (product: Product) => void;
}

const ProductRequestForm = ({ onAdd }: ProductRequestFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newProduct: Product = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim() || undefined,
      quantity,
    };
    
    onAdd(newProduct);
    
    // Reset form
    setName("");
    setQuantity(1);
    setDescription("");
  };

  return (
    <Card>
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
          
          <div className="mb-4">
            <label htmlFor="quantity" className="block mb-1 text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="flex items-center border rounded-md">
              <button 
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 border-r hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-3 py-2 text-center border-0 focus:ring-0 focus:outline-none"
                min="1"
              />
              <button 
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 border-l hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full text-white bg-kitchen-500 hover:bg-kitchen-600"
          >
            Add Item to Request List
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductRequestForm;
