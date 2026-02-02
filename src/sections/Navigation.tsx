import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Browse', href: '/managers' },
    { label: 'Locations', href: '/locations' },
    { label: 'Blog', href: '/blog' },
  ];

  const getTextColor = () => {
    if (!isHome || scrolled) return 'text-[#0B0F17]';
    return 'text-white';
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        !isHome || scrolled 
          ? 'bg-[#F6F7F9]/85 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className={`text-xl lg:text-2xl font-bold font-['Space_Grotesk'] transition-colors ${getTextColor()}`}>
              BNBinsights
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#D4A23F] text-[#0B0F17]">
              Dubai
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#D4A23F] ${getTextColor()}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/list-company"
              className={`text-sm font-medium transition-colors hover:text-[#D4A23F] ${getTextColor()}`}
            >
              List your company
            </Link>
            <Link 
              to="/login"
              className="btn-gold px-5 py-2.5 rounded-full text-sm font-semibold"
            >
              Sign in
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 transition-colors ${getTextColor()}`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#F6F7F9] border-t border-[#0B0F17]/8">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-[#0B0F17] font-medium py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/list-company"
              onClick={() => setMobileOpen(false)}
              className="block text-[#0B0F17] font-medium py-2"
            >
              List your company
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-[#0B0F17] font-medium py-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
