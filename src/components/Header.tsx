
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, cart } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserType = () => {
    setCurrentUser(currentUser === 'customer' ? 'merchant' : 'customer');
  };

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
          {currentUser === 'customer' ? (
            <>
              <Link to="/" className="text-gray-600 hover:text-kitchen-500">Home</Link>
              <Link to="/request" className="text-gray-600 hover:text-kitchen-500">Request Items</Link>
              <Link to="/orders" className="text-gray-600 hover:text-kitchen-500">My Orders</Link>
            </>
          ) : (
            <>
              <Link to="/merchant/requests" className="text-gray-600 hover:text-kitchen-500">Incoming Requests</Link>
              <Link to="/merchant/orders" className="text-gray-600 hover:text-kitchen-500">Active Orders</Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          {currentUser === 'customer' && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cart')}
              className="relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-kitchen-500 rounded-full -mt-1 -mr-1">
                  {cart.length}
                </span>
              )}
            </Button>
          )}

          <Button variant="outline" onClick={toggleUserType}>
            Switch to {currentUser === 'customer' ? 'Merchant' : 'Customer'}
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" className="md:hidden" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {currentUser === 'customer' ? (
              <>
                <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Home</Link>
                <Link to="/request" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Request Items</Link>
                <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>My Orders</Link>
              </>
            ) : (
              <>
                <Link to="/merchant/requests" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Incoming Requests</Link>
                <Link to="/merchant/orders" className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-kitchen-500" onClick={toggleMenu}>Active Orders</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
