import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Sun,
  Moon,
  User,
  LogOut,
  ShieldAlert,
  History,
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Menu,
  X,
  Coins,
  Cpu
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, logout, theme, toggleTheme, openAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'assistant', label: 'AI Diagnosis', badge: 'AI' },
    { id: 'costs', label: 'Repair Costs', icon: Coins, badge: 'Real Prices' },
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'safety', label: 'Safety Protocol', icon: ShieldAlert, alert: true },
    ...(user ? [{ id: 'history', label: 'History', icon: History }] : []),
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: LayoutDashboard }] : [])
  ];

  const handleNav = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-charcoal-900/85 border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo with Gen Z styling */}
        <div
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-acid" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-heading">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                RepairSathi<span className="text-blue-500">.ai</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-mono tracking-wider">
              HARDWARE INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-sans">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-charcoal-800 border border-blue-200/80 dark:border-white/[0.1] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-charcoal-850'
                }`}
              >
                {item.icon && <item.icon className={`w-3.5 h-3.5 ${item.alert ? 'text-amber-500' : ''}`} />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold tracking-wider rounded-md ${
                    item.badge === 'Real Prices'
                      ? 'bg-acid/20 text-emerald-600 dark:text-acid border border-acid/30'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons (Theme, Auth, Mobile Menu) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-charcoal-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-charcoal-900 rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] py-2 z-50 animate-fade-in"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-white/[0.06]">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Signed In As</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] rounded-full uppercase font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleNav('history');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-800 flex items-center gap-2"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Repair Sessions</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        handleNav('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-800 flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 dark:border-white/[0.06] mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-mono text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuth('login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-sm shadow-blue-500/20"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-charcoal-900/95 px-4 pt-3 pb-6 space-y-1 shadow-xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activePage === item.id
                  ? 'bg-blue-50 dark:bg-charcoal-800 text-blue-600 dark:text-white font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon && <item.icon className="w-4 h-4 text-slate-500" />}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-blue-600 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
