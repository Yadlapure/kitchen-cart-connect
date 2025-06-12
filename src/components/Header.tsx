import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { logout } from "@/store/authSlice";
import { FaShoppingCart, FaBars, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.app);
  const { user } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  function getNavLinks() {
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
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-kitchen-500">KitchenCart Connect</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-4 md:flex">
          {getNavLinks()}
        </nav>
        
        <div className="flex items-center space-x-4">
          {user?.role === 'customer' && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/request')}
              className="relative"
            >
              <FaShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-kitchen-500 rounded-full -mt-1 -mr-1">
                  {cart.length}
                </span>
              )}
            </Button>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <FaSignOutAlt className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden" onClick={toggleMenu}>
            <FaBars className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {getMobileNavLinks()}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
