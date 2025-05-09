
import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: 'requested' | 'quoted' | 'confirmed' | 'processing' | 'delivering' | 'completed';
}

const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'requested':
        return { label: 'Requested', variant: 'outline' as const };
      case 'quoted':
        return { label: 'Quoted', variant: 'secondary' as const };
      case 'confirmed':
        return { label: 'Confirmed', variant: 'default' as const, className: 'bg-blue-500' };
      case 'processing':
        return { label: 'Processing', variant: 'default' as const, className: 'bg-yellow-500' };
      case 'delivering':
        return { label: 'Out for Delivery', variant: 'default' as const, className: 'bg-orange-500' };
      case 'completed':
        return { label: 'Completed', variant: 'default' as const, className: 'bg-green-500' };
      default:
        return { label: status, variant: 'outline' as const };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;
