
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { submitMerchantQuote, verifyProduct } from "@/store/appSlice";
import { MerchantQuote, Product } from "@/store/appSlice";
import { toast } from "sonner";

interface MerchantQuoteCardProps {
  orderId: string;
  merchantId: string;
  products: Product[];
  existingQuote?: MerchantQuote;
}

const MerchantQuoteCard = ({ orderId, merchantId, products, existingQuote }: MerchantQuoteCardProps) => {
  const dispatch = useAppDispatch();
  const { merchants } = useAppSelector((state) => state.app);
  
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(existingQuote?.estimatedDeliveryTime || "");
  const [quoteNotes, setQuoteNotes] = useState(existingQuote?.quoteNotes || "");
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | 'UPI'>(existingQuote?.paymentMethod || "COD");

  const merchant = merchants.find(m => m.id === merchantId);
  
  // Get verified products for this merchant from existing quote or initialize from order products
  const getVerifiedProducts = () => {
    if (existingQuote) {
      return existingQuote.products;
    }
    return products.map(p => ({ ...p, isVerified: false, isAvailable: true }));
  };

  const [verifiedProducts, setVerifiedProducts] = useState<Product[]>(getVerifiedProducts());

  const handleProductVerification = (productId: string, price: number, isAvailable: boolean, notes?: string) => {
    dispatch(verifyProduct({
      orderId,
      merchantId,
      productId,
      price,
      isAvailable,
      notes
    }));

    setVerifiedProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, updatedPrice: price, isAvailable, isVerified: true, merchantNotes: notes }
        : p
    ));
  };

  const calculateTotal = () => {
    return verifiedProducts
      .filter(p => p.isAvailable)
      .reduce((sum, product) => sum + (product.updatedPrice || 0) * product.quantity, 0);
  };

  const handleSubmitQuote = () => {
    const unverifiedProducts = verifiedProducts.filter(p => !p.isVerified);
    if (unverifiedProducts.length > 0) {
      toast.error("Please verify all products before submitting quote");
      return;
    }

    const quote: MerchantQuote = {
      merchantId,
      products: verifiedProducts,
      total: calculateTotal(),
      estimatedDeliveryTime,
      quoteNotes,
      paymentMethod,
      submittedAt: new Date()
    };

    dispatch(submitMerchantQuote({ orderId, merchantQuote: quote }));
    toast.success("Quote submitted successfully!");
  };

  const allProductsVerified = verifiedProducts.every(p => p.isVerified);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quote from {merchant?.name}</span>
          {existingQuote && <Badge className="bg-green-500">Quote Submitted</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Verification */}
        <div>
          <h4 className="font-medium mb-3">Verify Items & Set Prices</h4>
          <div className="space-y-4">
            {verifiedProducts.map((product) => (
              <ProductVerificationForm
                key={product.id}
                product={product}
                onVerify={handleProductVerification}
                readOnly={!!existingQuote}
              />
            ))}
          </div>
        </div>

        {/* Quote Details */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Estimated Delivery Time
            </label>
            <Input
              value={estimatedDeliveryTime}
              onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
              placeholder="e.g., 2-3 business days"
              readOnly={!!existingQuote}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as any)}
              disabled={!!existingQuote}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COD">Cash on Delivery</SelectItem>
                <SelectItem value="Online">Online Payment</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Quote Notes (Optional)
            </label>
            <Textarea
              value={quoteNotes}
              onChange={(e) => setQuoteNotes(e.target.value)}
              placeholder="Additional notes about delivery, quality, etc."
              rows={3}
              readOnly={!!existingQuote}
            />
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        {!existingQuote && (
          <Button 
            onClick={handleSubmitQuote}
            className="w-full bg-kitchen-500 hover:bg-kitchen-600"
            disabled={!allProductsVerified}
          >
            Submit Quote
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface ProductVerificationFormProps {
  product: Product;
  onVerify: (productId: string, price: number, isAvailable: boolean, notes?: string) => void;
  readOnly?: boolean;
}

const ProductVerificationForm = ({ product, onVerify, readOnly = false }: ProductVerificationFormProps) => {
  const [price, setPrice] = useState(product.updatedPrice?.toString() || "");
  const [isAvailable, setIsAvailable] = useState(product.isAvailable !== false);
  const [notes, setNotes] = useState(product.merchantNotes || "");

  const handleVerify = () => {
    if (!price && isAvailable) {
      toast.error("Please enter a price for available items");
      return;
    }

    onVerify(product.id, parseFloat(price) || 0, isAvailable, notes.trim() || undefined);
    toast.success(`${product.name} verified`);
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
    <Card className={`${product.isVerified ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{product.name}</h4>
              {product.description && (
                <p className="text-sm text-gray-600">{product.description}</p>
              )}
              <Badge variant="outline" className="mt-1">
                {product.quantity} {getUnitDisplay(product.unit)}
              </Badge>
            </div>
            {product.isVerified && (
              <Badge className="bg-green-500">Verified</Badge>
            )}
          </div>

          {!readOnly && !product.isVerified && (
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded"
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
                  placeholder="Add notes about quality, delivery time, etc."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleVerify}
                className="w-full bg-kitchen-500 hover:bg-kitchen-600"
                size="sm"
              >
                Verify Item
              </Button>
            </div>
          )}

          {(readOnly || product.isVerified) && (
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

export default MerchantQuoteCard;
