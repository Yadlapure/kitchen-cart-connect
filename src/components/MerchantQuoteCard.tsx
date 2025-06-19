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
  const { merchants, orders } = useAppSelector((state) => state.app);
  
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(existingQuote?.estimatedDeliveryTime || "");
  const [quoteNotes, setQuoteNotes] = useState(existingQuote?.quoteNotes || "");
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online' | 'UPI'>(existingQuote?.paymentMethod || "COD");

  const merchant = merchants.find(m => m.id === merchantId);
  const order = orders.find(o => o.id === orderId);
  
  // Get the current merchant verification data from order state
  const currentMerchantData = order?.merchantQuotes?.find(q => q.merchantId === merchantId);
  
  // Check if quote is actually submitted (not just verification data)
  const isQuoteActuallySubmitted = currentMerchantData?.isQuoteSubmitted === true && currentMerchantData?.submittedAt;
  
  // Get products with their individual verification status
  const getProductsWithVerificationStatus = () => {
    if (currentMerchantData && currentMerchantData.products) {
      return currentMerchantData.products;
    }
    return products.map(p => ({ 
      ...p, 
      isVerified: false, 
      isAvailable: true,
      updatedPrice: undefined,
      merchantNotes: undefined
    }));
  };

  const verifiedProducts = getProductsWithVerificationStatus();

  const handleProductVerification = (productId: string, price: number, isAvailable: boolean, notes?: string) => {
    console.log(`🔧 Verifying ONLY product ${productId} - this is NOT quote submission`);
    
    dispatch(verifyProduct({
      orderId,
      merchantId,
      productId,
      price,
      isAvailable,
      notes
    }));

    const productName = products.find(p => p.id === productId)?.name;
    toast.success(`${productName} verified - continue verifying remaining items`);
  };

  const calculateTotal = () => {
    return verifiedProducts
      .filter(p => p.isAvailable && p.isVerified)
      .reduce((sum, product) => sum + (product.updatedPrice || 0) * product.quantity, 0);
  };

  const handleSubmitQuote = () => {
    const unverifiedProducts = verifiedProducts.filter(p => !p.isVerified);
    if (unverifiedProducts.length > 0) {
      toast.error(`Please verify all ${unverifiedProducts.length} remaining item(s) before submitting quote`);
      return;
    }

    if (!estimatedDeliveryTime.trim()) {
      toast.error("Please provide estimated delivery time");
      return;
    }

    const quote: MerchantQuote = {
      merchantId,
      products: verifiedProducts,
      total: calculateTotal(),
      estimatedDeliveryTime,
      quoteNotes,
      paymentMethod,
      submittedAt: new Date().toISOString(),
      isQuoteSubmitted: true
    };

    console.log('🚀 ACTUALLY SUBMITTING QUOTE:', quote);
    dispatch(submitMerchantQuote({ orderId, merchantQuote: quote }));
    toast.success("Quote submitted successfully! Customer will be notified.");
  };

  const allProductsVerified = verifiedProducts.every(p => p.isVerified);
  const verifiedCount = verifiedProducts.filter(p => p.isVerified).length;
  const totalCount = verifiedProducts.length;

  console.log('🔍 MerchantQuoteCard State Check:', {
    orderId,
    merchantId,
    verifiedCount,
    totalCount,
    allProductsVerified,
    isQuoteActuallySubmitted,
    hasVerificationData: !!currentMerchantData,
    submittedAt: currentMerchantData?.submittedAt
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quote from {merchant?.name}</span>
          <div className="flex items-center gap-2">
            {!isQuoteActuallySubmitted && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {verifiedCount}/{totalCount} Verified
              </Badge>
            )}
            {isQuoteActuallySubmitted && <Badge className="bg-green-500">Quote Submitted</Badge>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Verification */}
        <div>
          <h4 className="font-medium mb-3">Verify Items & Set Prices</h4>
          {!isQuoteActuallySubmitted && (
            <p className="text-sm text-gray-600 mb-4">
              Verify each item individually. Quote will only be sent to customer after all items are verified.
            </p>
          )}
          <div className="space-y-4">
            {verifiedProducts.map((product) => (
              <ProductVerificationForm
                key={product.id}
                product={product}
                onVerify={handleProductVerification}
                readOnly={isQuoteActuallySubmitted}
              />
            ))}
          </div>
        </div>

        {/* Quote Details */}
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Estimated Delivery Time *
            </label>
            <Input
              value={estimatedDeliveryTime}
              onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
              placeholder="e.g., 2-3 business days"
              disabled={isQuoteActuallySubmitted}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as any)}
              disabled={isQuoteActuallySubmitted}
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
              disabled={isQuoteActuallySubmitted}
            />
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>
          {!allProductsVerified && !isQuoteActuallySubmitted && (
            <p className="text-sm text-gray-600 mt-1">
              Total will update as you verify more items
            </p>
          )}
        </div>

        {/* Submit Button */}
        {!isQuoteActuallySubmitted && (
          <Button 
            onClick={handleSubmitQuote}
            className="w-full bg-kitchen-500 hover:bg-kitchen-600"
            disabled={!allProductsVerified || !estimatedDeliveryTime.trim()}
          >
            {allProductsVerified 
              ? "Submit Complete Quote to Customer" 
              : `Verify Remaining ${totalCount - verifiedCount} Item(s) First`
            }
          </Button>
        )}

        {isQuoteActuallySubmitted && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 font-medium">✅ Quote Submitted Successfully</p>
            <p className="text-sm text-blue-600 mt-1">Customer has been notified and can now review your quote.</p>
          </div>
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
  // Initialize with the EXACT current state of THIS specific product
  const [price, setPrice] = useState(product.updatedPrice?.toString() || "");
  const [isAvailable, setIsAvailable] = useState(product.isAvailable !== false);
  const [notes, setNotes] = useState(product.merchantNotes || "");

  const handleVerify = () => {
    if (!price && isAvailable) {
      toast.error("Please enter a price for available items");
      return;
    }

    if (parseFloat(price) <= 0 && isAvailable) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    onVerify(product.id, parseFloat(price) || 0, isAvailable, notes.trim() || undefined);
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

  console.log(`ProductVerificationForm for ${product.name}:`, {
    id: product.id,
    isVerified: product.isVerified,
    isAvailable: product.isAvailable,
    updatedPrice: product.updatedPrice,
    merchantNotes: product.merchantNotes
  });

  return (
    <Card className={`${product.isVerified ? 'border-green-500 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
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
            {product.isVerified ? (
              <Badge className="bg-green-500">✓ Verified</Badge>
            ) : (
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                Pending Verification
              </Badge>
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
                    Your Price (₹) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter your price"
                    required
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
                ✓ Verify This Item
              </Button>
            </div>
          )}

          {(readOnly || product.isVerified) && (
            <div className="space-y-2 text-sm bg-white p-3 rounded border">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={product.isAvailable ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {product.isAvailable ? "✓ Available" : "✗ Not Available"}
                </span>
              </div>
              {product.isAvailable && product.updatedPrice && (
                <div className="flex justify-between">
                  <span className="font-medium">Price:</span>
                  <span className="font-bold text-green-600">₹{product.updatedPrice}</span>
                </div>
              )}
              {product.merchantNotes && (
                <div>
                  <span className="font-medium">Notes:</span>
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
