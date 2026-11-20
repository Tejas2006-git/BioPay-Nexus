import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, QrCode, FileText, History, User,
  LogOut, Shield, Menu, X, Bell, ChevronRight,
  Fingerprint, Zap
} from 'lucide-react';
import { clearUser, getUser } from '../utils/storage';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: QrCode, label: 'QR Scanner', path: '/qr-scanner' },
  { icon: FileText, label: 'Invoice Scanner', path: '/invoice-scanner' },
  { icon: History, label: 'Transactions', path: '/transaction-history' },
  { icon: Fingerprint, label: 'Biometric Auth', path: '/biometric-verification' },
  { icon: User, label: 'Profile & Security', path: '/profile' },
];

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">BioPay Nexus</div>
            <div className="text-cyan-400 text-xs">AI Fintech Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => { navigate(path); setSidebarOpen(false); }}
              className={active ? 'nav-link-active w-full text-left' : 'nav-link w-full text-left'}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-white/40 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 border-r border-white/5 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-navy-900 border-r border-white/5 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-navy-950/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Secured</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
