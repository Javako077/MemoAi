import Sidebar from './Sidebar';
import AIVoiceAssistant from './AIVoiceAssistant';
import { useUser } from '../context/UserContext';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const { settings, sidebarCollapsed } = useUser();
  const location = useLocation();
  const isLight = settings.theme === 'light';

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0f172a] text-white'} relative overflow-hidden`}>
      <div className={`absolute inset-0 z-0 pointer-events-none opacity-30 ${isLight ? 'opacity-10' : ''}`}>
        <div className="absolute top-0 left-0 w-full h-full mesh-gradient"></div>
      </div>
      <Sidebar />
      <main className={`
        flex-1 transition-all duration-500 z-10 
        ${location.pathname === '/chat' ? '' : 'p-4 md:p-10 lg:p-12'}
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        ml-0 pt-16 lg:pt-0
      `}>
        <div className={location.pathname === '/chat' ? '' : 'max-w-7xl mx-auto'}>
          {children}
        </div>
      </main>
      <AIVoiceAssistant />
    </div>
  );
}
