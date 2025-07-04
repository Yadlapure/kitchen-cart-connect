
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logout } from "@/store/authSlice";
import { FaShoppingCart, FaBars, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { MapPin, ChevronDown, User, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import LocationSelector from './LocationSelector';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.app);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleCartClick = () => {
    navigate('/request');
  };

  const handleLocationSelect = (location: string) => {
    setIsLocationSelectorOpen(false);
  };

  const getDisplayLocation = () => {
    if (user?.selectedLocation) {
      return user.selectedLocation;
    }
    return "Select Location";
  };

  const getDefaultAddress = () => {
    if (user?.addresses) {
      return user.addresses.find(addr => addr.isDefault);
    }
    return null;
  };

  function getNavLinks() {
    if (!user) return null;
    
    switch (user?.role) {
      case 'customer':
        return (
          <>
            <Link to="/" className="text-gray-600 hover:text-kitchen-500">Home</Link>
            <Link to="/request" className="text-gray-600 hover:text-kitchen-500">Request Items</Link>
            <Link to="/orders" className="text-gray-600 hover:text-kitchen-500">My Orders</Link>
          </>
        );
      case 'merchant':
        return (
          <>
            <Link to="/merchant/requests" className="text-gray-600 hover:text-kitchen-500">Incoming Requests</Link>
            <Link to="/merchant/orders" className="text-gray-600 hover:text-kitchen-500">Active Orders</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin/dashboard" className="text-gray-600 hover:text-kitchen-500">Dashboard</Link>
            <Link to="/admin/merchants" className="text-gray-600 hover:text-kitchen-500">Merchants</Link>
            <Link to="/admin/orders" className="text-gray-600 hover:text-kitchen-500">All Orders</Link>
          </>
        );
      default:
        return null;
    }
  }

  function getMobileNavLinks() {
    if (!user) return null;
    
    switch (user?.role) {
      case 'customer':
        return (
          <>
            <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Home</Link>
            <Link to="/request" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Request Items</Link>
            <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>My Orders</Link>
          </>
        );
      case 'merchant':
        return (
          <>
            <Link to="/merchant/requests" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Incoming Requests</Link>
            <Link to="/merchant/orders" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Active Orders</Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin/dashboard" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Dashboard</Link>
            <Link to="/admin/merchants" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Merchants</Link>
            <Link to="/admin/orders" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>All Orders</Link>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center space-x-4">
          {/* Location Selector - Swiggy/Zomato Style */}
          {user?.role === 'customer' && (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsLocationSelectorOpen(true)}
                className="flex items-center space-x-2 text-left hover:bg-gray-50 px-2 py-1 h-auto"
              >
                <MapPin className="w-4 h-4 text-kitchen-500" />
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-800 max-w-32 truncate">
                      {getDisplayLocation()}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </div>
                  {getDisplayLocation() !== "Select Location" && (
                    <span className="text-xs text-gray-500">Delivering to</span>
                  )}
                </div>
              </Button>
            </div>
          )}

          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-kitchen-500 hidden sm:block">KitchenCart Connect</span>
            <span className="text-lg font-bold text-kitchen-500 sm:hidden">KCC</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-4 md:flex">
          {getNavLinks()}
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* Cart Icon - Always visible */}
          <Button 
            variant="ghost" 
            onClick={handleCartClick}
            className="relative"
          >
            <FaShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-kitchen-500 rounded-full -mt-1 -mr-1">
                {cart.length}
              </span>
            )}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.name}</span>
              
              {/* User Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                  {user?.role === 'customer' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile & Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/orders')} className="cursor-pointer">
                        <FaShoppingCart className="w-4 h-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <FaSignOutAlt className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleLogin} className="bg-kitchen-500 hover:bg-kitchen-600 text-white">
              <FaSignInAlt className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}

          {/* Mobile menu button */}
          {user && (
            <Button variant="ghost" className="md:hidden" onClick={toggleMenu}>
              <FaBars className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && user && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {getMobileNavLinks()}
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={getDisplayLocation()}
      />
    </header>
  );
};

export default Header;
