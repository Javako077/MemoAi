import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertCircle,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { translations } from '../utils/translations';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const { logout, user, settings, updateSettings, sidebarCollapsed, setSidebarCollapsed } = useUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const t = translations[settings.language] || translations.English;
  const isLight = settings.theme === 'light';

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, path: '/dashboard' },
    { icon: MessageSquare, label: t.chat, path: '/chat' },
    { icon: Activity, label: t.medicines, path: '/medicines' },
    { icon: GraduationCap, label: t.routine, path: '/routine' },
    { icon: AlertCircle, label: t.emergency, path: '/emergency' },
    { icon: User, label: t.profile, path: '/elder-profile' },
    { icon: Settings, label: t.settings, path: '/settings' },
  ];

  const toggleLanguage = () => {
    updateSettings({ language: settings.language === 'English' ? 'Hindi' : 'English' });
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 z-[60] flex items-center justify-between px-6 border-b transition-colors ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'} backdrop-blur-xl`}>
        <span className={`text-xl font-black ${isLight ? 'text-indigo-600' : 'bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent'}`}>
          MemoAi
        </span>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed left-0 top-0 h-screen transition-all duration-500 z-[80] flex flex-col
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        w-72 lg:translate-x-0 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isLight ? 'bg-white border-r border-slate-200' : 'bg-slate-900 lg:bg-slate-900/50 lg:backdrop-blur-xl border-r border-slate-800 shadow-2xl lg:shadow-none'}
      `}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <span className={`text-2xl font-black transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 pointer-events-none' : 'opacity-100'} ${isLight ? 'text-indigo-600' : 'bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent'}`}>
            MemoAi
          </span>
          <button
            onClick={() => isMobileOpen ? setIsMobileOpen(false) : setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 rounded-xl transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            {isMobileOpen ? <X size={24} /> : (sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />)}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-4 lg:py-3 rounded-2xl transition-all group ${isActive
                  ? (isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30')
                  : (isLight ? 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white')
                  }`}
              >
                <item.icon size={22} className={`transition-transform group-active:scale-90 ${isActive ? 'scale-110' : ''}`} />
                <span className={`font-bold transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden opacity-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 space-y-2 ${isLight ? 'border-t border-slate-100' : 'border-t border-slate-800'}`}>
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all ${isLight ? 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600' : 'text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400'}`}
          >
            <Globe size={22} className={settings.language === 'Hindi' ? 'text-indigo-400' : ''} />
            <span className={`font-bold ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{settings.language}</span>
          </button>

          <button
            onClick={logout}
            className={`flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all ${isLight ? 'text-slate-600 hover:bg-red-50 hover:text-red-600' : 'text-slate-400 hover:bg-red-500/10 hover:text-red-400'}`}
          >
            <LogOut size={22} />
            <span className={`font-bold ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{t.logout}</span>
          </button>

          <div className={`mt-4 flex items-center gap-3 px-2 py-3 rounded-2xl border transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-700/50'} ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg overflow-hidden ${!user?.avatar ? 'bg-gradient-to-tr from-indigo-500 to-purple-500' : ''}`}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>
            <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
              <p className={`text-sm font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'User'}</p>
              <p className="text-[10px] text-indigo-500 uppercase font-black tracking-widest">{user?.role || 'Elder'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
