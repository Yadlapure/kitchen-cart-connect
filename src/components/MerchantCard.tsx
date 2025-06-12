
import { Card, CardContent } from "@/components/ui/card";
import { Merchant } from "@/store/appSlice";
import { Button } from "@/components/ui/button";

interface MerchantCardProps {
  merchant: Merchant;
  onSelect: (merchant: Merchant) => void;
}

const MerchantCard = ({ merchant, onSelect }: MerchantCardProps) => {
  return (
    <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="h-40 overflow-hidden bg-gray-100">
        <img 
          src={merchant.image} 
          alt={merchant.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{merchant.name}</h3>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm font-medium">{merchant.rating}</span>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {merchant.deliveryTime}
          </div>
        </div>
        
        <div className="flex flex-wrap mt-2 gap-1">
          {merchant.categories.map((category, idx) => (
            <span 
              key={idx} 
              className="px-2 py-1 text-xs bg-gray-100 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        
        <Button 
          className="w-full mt-4 bg-kitchen-500 hover:bg-kitchen-600"
          onClick={() => onSelect(merchant)}
        >
          Select
        </Button>
      </CardContent>
    </Card>
  );
};

export default MerchantCard;
