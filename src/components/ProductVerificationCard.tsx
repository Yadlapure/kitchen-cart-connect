
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/store/appSlice";
import { useAppDispatch } from "@/hooks/redux";
import { verifyProduct } from "@/store/appSlice";

interface ProductVerificationCardProps {
  product: Product;
  orderId: string;
  isVerified?: boolean;
}

const ProductVerificationCard = ({ product, orderId, isVerified = false }: ProductVerificationCardProps) => {
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState(product.updatedPrice?.toString() || "");
  const [isAvailable, setIsAvailable] = useState(product.isAvailable !== false);
  const [notes, setNotes] = useState(product.merchantNotes || "");

  const handleVerify = () => {
    if (!price && isAvailable) {
      alert("Please enter a price for available items");
      return;
    }

    dispatch(verifyProduct({
      orderId,
      productId: product.id,
      price: parseFloat(price) || 0,
      isAvailable,
      notes: notes.trim() || undefined
    }));
  };

  const getUnitDisplay = (unit: string) => {
    switch (unit) {
      case 'gram': return 'g';
      case 'kg': return 'kg';
      case 'liter': return 'L';
      case 'piece': return 'pc';
      case 'number': return 'nos';
      default: return unit;
    }
  };

  return (
    <Card className={`${isVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{product.name}</h4>
              {product.description && (
                <p className="text-sm text-gray-600">{product.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {product.quantity} {getUnitDisplay(product.unit)}
                </Badge>
                {product.price && (
                  <Badge variant="secondary">
                    Expected: ₹{product.price}
                  </Badge>
                )}
              </div>
            </div>
            {isVerified && (
              <Badge className="bg-green-500">Verified</Badge>
            )}
          </div>

          {!isVerified && (
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
                <span className="text-sm">Item Available</span>
              </div>

              {isAvailable && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Price (₹)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter your price"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about availability, quality, delivery time, etc."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleVerify}
                className="w-full bg-kitchen-500 hover:bg-kitchen-600"
              >
                Verify Item
              </Button>
            </div>
          )}

          {isVerified && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isAvailable ? "text-green-600" : "text-red-600"}>
                  {isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
              {isAvailable && (
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">₹{product.updatedPrice}</span>
                </div>
              )}
              {product.merchantNotes && (
                <div>
                  <span>Notes:</span>
                  <p className="text-gray-600 mt-1">{product.merchantNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVerificationCard;
