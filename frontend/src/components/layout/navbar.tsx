import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, ShoppingCart, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleLocateUs = () => {

    const mapsUrl = "https://www.google.com/maps/place/Savatsa+Gau+Savardhan/@19.1286699,73.2314941,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7ed005b6d2dd1:0xc4ef2742f5d9bfad!8m2!3d19.1286648!4d73.234069!16s%2Fg%2F11x5lg19np?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D";
    window.open(mapsUrl, '_blank');
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-serif text-xl md:text-2xl font-bold text-sawatsya-earth whitespace-nowrap">SAVATSYA GAU SAMVARDHAN</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-6 whitespace-nowrap">
              <Link to="/" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">Home</Link>
              <Link to="/products" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">Products</Link>
              <Link to="/about" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">About</Link>
              <Link to="/contact" className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">Contact</Link>
              <button
                onClick={handleLocateUs}
                className="px-3 py-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <MapPin size={16} />
                Locate Us
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 whitespace-nowrap">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2 text-sawatsya-wood hover:bg-sawatsya-cream hover:text-sawatsya-earth transition-all duration-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-sawatsya-earth flex items-center justify-center text-sm font-medium hover:bg-sawatsya-terracotta hover:scale-105 transition-all duration-200 shadow-sm">
                        {(() => {
                          const avatarSrc = user?.avatar || user?.profilePicture || null;
                          if (avatarSrc) {
                            return <img src={avatarSrc} alt={user?.name || 'User'} className="w-full h-full object-cover hover:brightness-110 transition-all duration-200" />;
                          }
                          return <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>;
                        })()}
                      </div>
                      <span className="hidden lg:block font-medium">{user?.name}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" className="p-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors">
                <User size={20} />
              </Link>
            )}

            <Link to="/cart" className="p-2 text-sawatsya-wood hover:text-sawatsya-terracotta transition-colors relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-sawatsya-terracotta text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <Link to="/cart" className="p-2 mr-2 text-sawatsya-wood relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-sawatsya-terracotta text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </div>

      { }
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-sawatsya-sand animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/"
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link to="/products"
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link to="/about"
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link to="/contact"
              className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <button
              onClick={() => {
                handleLocateUs();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
            >
              <MapPin size={16} className="inline mr-2" />
              Locate Us
            </button>

            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-t border-sawatsya-sand hover:bg-sawatsya-cream transition-colors duration-200 rounded-md mx-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-sawatsya-earth text-white flex items-center justify-center text-sm font-medium hover:bg-sawatsya-terracotta hover:scale-105 transition-all duration-200 shadow-sm">
                      {(() => {
                        const avatarSrc = user?.avatar || user?.profilePicture || null;
                        if (avatarSrc) {
                          return <img src={avatarSrc} alt={user?.name || 'User'} className="w-full h-full object-cover hover:brightness-110 transition-all duration-200" />;
                        }
                        return <span className="text-white font-semibold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>;
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-sawatsya-wood">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <Link to="/profile"
                  className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} className="inline mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
                >
                  <LogOut size={16} className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login"
                className="block px-3 py-2 text-sawatsya-wood hover:bg-sawatsya-cream rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} className="inline mr-2" />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
