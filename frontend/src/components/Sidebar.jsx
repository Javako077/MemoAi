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
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useUser();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Memo Assistant', path: '/chat' },
    { icon: Activity, label: 'Medicines', path: '/medicines' },
    { icon: GraduationCap, label: 'My Routine', path: '/routine' },
    { icon: User, label: 'Emergency', path: '/emergency' },
    { icon: Settings, label: 'Elder Profile', path: '/elder-profile' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            MemoAi
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
            >
              <item.icon size={22} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
        >
          <LogOut size={22} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="mt-4 flex items-center gap-3 px-2 py-3 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
