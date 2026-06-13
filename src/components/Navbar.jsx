import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 animate-fade-in" onClick={handleLinkClick}>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
              Cer<span className="text-amber-500">Ver</span>
            </span>
            <span className="h-4 w-px bg-slate-200 hidden sm:inline" />
            <span className="text-xs text-slate-400 hidden sm:inline uppercase tracking-wider font-semibold">Certificate Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link to="/memberships" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Memberships
                </Link>
                <Link 
                  to={isAdmin ? "/admin" : "/dashboard"} 
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <Link to="/verify" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Verify
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold bg-slate-950 text-white px-5 py-2 rounded-xl hover:bg-amber-500 hover:text-gray-950 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/memberships" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Memberships
                </Link>
                <Link to="/verify" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Verify
                </Link>
                <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-bold bg-slate-950 text-white px-5 py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 transition-all duration-200 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-all duration-200"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/memberships" 
                    onClick={handleLinkClick}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Memberships
                  </Link>
                  <Link 
                    to={isAdmin ? "/admin" : "/dashboard"} 
                    onClick={handleLinkClick}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    {isAdmin ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                  <Link 
                    to="/verify" 
                    onClick={handleLinkClick}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Verify Certificate
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/memberships" 
                    onClick={handleLinkClick}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Memberships
                  </Link>
                  <Link 
                    to="/verify" 
                    onClick={handleLinkClick}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Verify Certificate
                  </Link>
                  <Link 
                    to="/login" 
                    onClick={handleLinkClick}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={handleLinkClick}
                    className="bg-slate-950 text-white px-4 py-2.5 rounded-xl hover:bg-amber-500 hover:text-slate-950 font-bold transition-all text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
