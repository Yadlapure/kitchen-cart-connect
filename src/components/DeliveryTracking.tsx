
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  rating: number;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedArrival: string;
}

interface DeliveryTrackingProps {
  orderId: string;
  orderStatus: string;
  deliveryBoy?: DeliveryBoy;
  customerAddress: string;
}

const DeliveryTracking = ({ orderId, orderStatus, deliveryBoy, customerAddress }: DeliveryTrackingProps) => {
  const [currentLocation, setCurrentLocation] = useState(deliveryBoy?.currentLocation);
  const [estimatedTime, setEstimatedTime] = useState(deliveryBoy?.estimatedArrival || '15-20 mins');

  // Simulate real-time location updates
  useEffect(() => {
    if (!deliveryBoy || orderStatus !== 'out_for_delivery') return;

    const interval = setInterval(() => {
      // Simulate location updates (in real app, this would come from WebSocket/API)
      setCurrentLocation(prev => prev ? {
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        address: `Moving towards ${customerAddress.split(',')[0]}`
      } : undefined);
      
      // Update estimated time
      const randomTime = Math.floor(Math.random() * 5) + 10;
      setEstimatedTime(`${randomTime}-${randomTime + 5} mins`);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [deliveryBoy, orderStatus, customerAddress]);

  if (!deliveryBoy || orderStatus !== 'out_for_delivery') {
    return null;
  }

  const handleCallDeliveryBoy = () => {
    // In real app, this would initiate a call
    window.open(`tel:${deliveryBoy.phone}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-kitchen-500" />
            Live Tracking
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Out for Delivery
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Delivery Boy Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-kitchen-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{deliveryBoy.name}</p>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">★ {deliveryBoy.rating}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-sm text-gray-600">Delivery Partner</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCallDeliveryBoy}
            className="flex items-center space-x-1"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </Button>
        </div>

        {/* Current Location */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-kitchen-500" />
            <span className="text-sm font-medium text-gray-700">Current Location</span>
          </div>
          <p className="text-sm text-gray-600 pl-6">
            {currentLocation?.address || 'Updating location...'}
          </p>
        </div>

        {/* Estimated Arrival */}
        <div className="flex items-center justify-between p-3 bg-kitchen-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-kitchen-500" />
            <span className="text-sm font-medium text-gray-700">Estimated Arrival</span>
          </div>
          <span className="text-sm font-bold text-kitchen-600">{estimatedTime}</span>
        </div>

        {/* Delivery Address */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Delivering to</span>
          </div>
          <p className="text-sm text-gray-600 pl-4">
            {customerAddress}
          </p>
        </div>

        {/* Live Update Indicator */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTracking;
