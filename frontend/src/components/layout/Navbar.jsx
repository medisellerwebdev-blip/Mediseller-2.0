import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  ChevronDown,
  Phone,
  LogOut,
  Package,
  FileText,
} from 'lucide-react';
import CartSidebar from '../cart/CartSidebar';

const categories = [
  { name: 'Cancer', slug: 'Cancer', icon: '🎗️' },
  { name: 'HIV/AIDS', slug: 'HIV/AIDS', icon: '💊' },
  { name: 'Hepatitis', slug: 'Hepatitis', icon: '🏥' },
  { name: 'Erectile Dysfunction', slug: 'Erectile Dysfunction', icon: '💪' },
  { name: 'Diabetes & Insulin', slug: 'Diabetes & Insulin', icon: '🩺' },
  { name: 'Weight Loss', slug: 'Weight Loss', icon: '⚖️' },
];

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Navbar = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { itemCount, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteConfig, setSiteConfig] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/site-config`);
        if (res.ok) {
          const data = await res.json();
          setSiteConfig(data);
        }
      } catch (error) {
        console.error('Navbar config fetch error:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-slate-900 text-white py-2 text-sm">
        <div className="container-custom flex justify-between items-center">
          <p className="hidden sm:block">45+ Years of Trusted Service | 30+ Countries | 100% Authentic Medications</p>
          <p className="sm:hidden text-xs">45+ Years | 30+ Countries</p>
          <div className="flex items-center gap-4">
            <a href="tel:+1234567890" className="flex items-center gap-1 hover:text-primary-200 transition-colors">
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">+1 (234) 567-890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              {siteConfig?.header?.logo_url ? (
                <img src={siteConfig.header.logo_url} alt="Logo" className="h-10 w-auto" />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {siteConfig?.header?.logo_text?.charAt(0) || 'M'}
                  </span>
                </div>
              )}
              <span className="font-heading font-bold text-xl text-slate-900">
                {siteConfig?.header?.logo_text || 'MediSeller'}
              </span>
            </Link>

            {/* Search bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  data-testid="search-input"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                  data-testid="search-button"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Dynamic Nav Items */}
              {(siteConfig?.header?.nav_items || []).map((item, idx) => {
                if (item.label === 'Categories') {
                  return (
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 text-slate-700 hover:text-primary font-medium transition-colors" data-testid="categories-dropdown">
                          Categories
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        {categories.map((cat) => (
                          <DropdownMenuItem key={cat.slug} asChild>
                            <Link
                              to={`/products?category=${encodeURIComponent(cat.slug)}`}
                              className="flex items-center gap-2"
                              data-testid={`category-${cat.slug}`}
                            >
                              <span>{cat.icon}</span>
                              {cat.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <Link 
                    key={idx} 
                    to={item.path} 
                    className="text-slate-700 hover:text-primary font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Cart button */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-slate-700 hover:text-primary transition-colors"
                data-testid="cart-button"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-100 transition-colors" data-testid="user-menu-button">
                      {user?.picture ? (
                        <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/prescriptions" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Prescriptions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={login}
                  variant="outline"
                  className="hidden sm:flex rounded-full"
                  data-testid="login-button"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 text-slate-700" data-testid="mobile-menu-button">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-heading font-bold text-xl">Menu</span>
                    </div>

                    {/* Mobile search */}
                    <form onSubmit={handleSearch} className="mb-6">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search medications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Search className="w-5 h-5" />
                        </button>
                      </div>
                    </form>

                    {/* Mobile navigation */}
                    <nav className="flex-1">
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categories</p>
                        {categories.map((cat) => (
                          <Link
                            key={cat.slug}
                            to={`/products?category=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 py-2 text-slate-700 hover:text-primary transition-colors"
                          >
                            <span>{cat.icon}</span>
                            {cat.name}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-slate-200 pt-4 space-y-2">
                        <Link
                          to="/products"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 text-slate-700 hover:text-primary font-medium"
                        >
                          All Products
                        </Link>
                        <Link
                          to="/consultation"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 text-slate-700 hover:text-primary font-medium"
                        >
                          Expert Consultation
                        </Link>
                        <Link
                          to="/about"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 text-slate-700 hover:text-primary font-medium"
                        >
                          About Us
                        </Link>
                        <Link
                          to="/contact"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 text-slate-700 hover:text-primary font-medium"
                        >
                          Contact
                        </Link>
                      </div>
                    </nav>

                    {/* Mobile auth */}
                    {!isAuthenticated && (
                      <div className="pt-4 border-t border-slate-200">
                        <Button onClick={login} className="w-full rounded-full">
                          <User className="w-4 h-4 mr-2" />
                          Sign In with Google
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default Navbar;
