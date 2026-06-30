import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  User
} from 'lucide-react';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Define navigation links based on user role (removed icons and Profile from list)
  const getNavLinks = () => {
    if (user.role === 'student') {
      return [
        { name: 'Home', path: '/dashboard' },
        { name: 'Browse Projects', path: '/projects' },
        { name: 'My Projects', path: '/my-projects' },
        { name: 'Notifications', path: '/notifications', badge: unreadCount }
      ];
    } else {
      // recruiter
      return [
        { name: 'Home', path: '/dashboard' },
        { name: 'Browse Projects', path: '/projects' },
        { name: 'Saved Projects', path: '/saved-projects' },
        { name: 'Following', path: '/following' },
        { name: 'Notifications', path: '/notifications', badge: unreadCount }
      ];
    }
  };

  const navLinks = getNavLinks();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/80 w-full">
        <div className="navbar-container">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              Project Showcase
            </Link>
            {/* <span className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-extrabold">
              {user.role}
            </span> */}
          </div>

          {/* Desktop Nav Links (No icons) */}
          <nav className="hidden lg:flex items-center gap-3">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`nav-link ${active ? 'nav-link-active' : ''}`}
                >
                  <span className="relative pr-5">
                    {link.name}
                    {link.badge > 0 && (
                      <span className="absolute -top-2 right-0 bg-red-500 text-white text-[9px] font-extrabold h-4.5 min-w-4.5 px-0.5 flex items-center justify-center border border-zinc-955 leading-none shadow-sm select-none">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: User Profile & Logout */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Clickable Profile Navigation Wrap */}
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}
            >
              {user.profilePictureUrl ? (
                <img 
                  src={user.profilePictureUrl} 
                  alt={user.name} 
                  className="rounded-full object-cover border border-zinc-800" 
                  style={{ width: '18px', height: '18px', minWidth: '18px' }}
                />
              ) : (
                <User className="h-4.5 w-4.5" />
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 active:scale-[0.97] transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Notification bell quick link */}
            <Link to="/notifications" className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-850 bg-zinc-900 p-4 space-y-3 flex flex-col">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-link w-full justify-between px-3.5 py-2.5 rounded-xl ${
                      active ? 'nav-link-active' : ''
                    }`}
                  >
                    <span className="relative pr-5">
                      {link.name}
                      {link.badge > 0 && (
                        <span className="absolute -top-2 right-0 bg-red-500 text-white text-[9px] font-extrabold h-4.5 min-w-4.5 px-0.5 flex items-center justify-center border border-zinc-955 leading-none shadow-sm select-none">
                          {link.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
            
            <div className="border-t border-zinc-850 pt-3 flex items-center justify-between">
              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                {user.profilePictureUrl ? (
                  <img 
                    src={user.profilePictureUrl} 
                    alt={user.name} 
                    className="rounded-full object-cover border border-zinc-800" 
                    style={{ width: '32px', height: '32px', minWidth: '32px' }}
                  />
                ) 
                : (
                  <div 
                    className="rounded-full bg-zinc-800 border border-zinc-750 text-zinc-350 flex items-center justify-center"
                    style={{ width: '32px', height: '32px', minWidth: '32px' }}
                  >
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-zinc-350">{user.name}</p>
                  <p className="text-[9px] text-zinc-550">{user.email}</p>
                </div>
              </Link>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Pages Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <Outlet />
      </main>

    </div>
  );
}
