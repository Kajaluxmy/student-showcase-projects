import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'users', path: '/users?role=student' },
    { name: 'Showcase', path: '/projects' },
    { name: 'Notifications', path: '/notifications', badge: unreadCount }
  ];

  const isActive = (path) => {
    const [pathname, search] = path.split('?');
    if (search) {
      return location.pathname === pathname && location.search.includes(search);
    }
    return location.pathname === pathname;
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 w-full">
        <div className="navbar-container">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-base font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight flex items-center gap-1.5">
              <span>Showcase Admin</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-3">
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
                      <span className="absolute -top-2 right-0 bg-red-500 text-white text-[9px] font-extrabold h-4.5 min-w-4.5 px-0.5 flex items-center justify-center border border-slate-950 leading-none shadow-sm select-none">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: User Profile & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/profile" 
              className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}
              title="Account Settings"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 text-[10px] font-black shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
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
          <div className="flex md:hidden items-center gap-2">
            {/* Notification bell quick link */}
            <Link to="/notifications" className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-850 bg-slate-900 p-4 space-y-3 flex flex-col">
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
                        <span className="absolute -top-2 right-0 bg-red-500 text-white text-[9px] font-extrabold h-4.5 min-w-4.5 px-0.5 flex items-center justify-center border border-slate-950 leading-none shadow-sm select-none">
                          {link.badge}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
            
            <div className="border-t border-slate-850 pt-3 flex items-center justify-between">
              <Link 
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
              >
                <div 
                  className="rounded-full bg-blue-600/10 border border-blue-500/25 text-blue-400 flex items-center justify-center text-sm font-black"
                  style={{ width: '32px', height: '32px', minWidth: '32px' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-350">{user.name}</p>
                  <p className="text-[9px] text-slate-550">{user.email}</p>
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
