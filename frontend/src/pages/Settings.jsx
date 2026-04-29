import { useUser } from '../context/UserContext';
import { 
  Moon, 
  Sun, 
  Bell, 
  Lock, 
  Globe, 
  Smartphone,
  Eye,
  Type
} from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useUser();

  const toggleSetting = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const sections = [
    {
      title: 'Appearance',
      icon: Eye,
      items: [
        { 
          label: 'Dark Mode', 
          desc: 'Use the dark theme for better eye comfort.', 
          icon: Moon, 
          value: settings.theme === 'dark',
          action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
        },
        { 
          label: 'Font Size', 
          desc: 'Adjust the display text size.', 
          icon: Type, 
          value: settings.fontSize === 'large',
          action: () => updateSettings({ fontSize: settings.fontSize === 'large' ? 'medium' : 'large' })
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { 
          label: 'Desktop Notifications', 
          desc: 'Receive alerts when your quiz is ready.', 
          icon: Smartphone, 
          value: settings.notifications,
          action: () => toggleSetting('notifications')
        }
      ]
    },
    {
      title: 'General',
      icon: Globe,
      items: [
        { 
          label: 'Language', 
          desc: settings.language, 
          icon: Globe, 
          action: () => updateSettings({ language: settings.language === 'English' ? 'Hindi' : 'English' }) 
        },
        { 
          label: 'Privacy Mode', 
          desc: 'Hide your activity from other users.', 
          icon: Lock, 
          value: false,
          action: () => {} 
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-2">Customize your MemoAi experience.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="glass-panel overflow-hidden">
            <div className="bg-slate-800/40 px-8 py-4 border-b border-slate-700 flex items-center gap-3">
              <section.icon size={20} className="text-indigo-400" />
              <h2 className="font-bold">{section.title}</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {section.items.map((item) => (
                <div key={item.label} className="p-8 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.label}</h3>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  
                  {typeof item.value !== 'undefined' ? (
                    <button 
                      onClick={item.action}
                      className={`w-12 h-6 rounded-full transition-colors relative ${item.value ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.value ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  ) : (
                    <button 
                      onClick={item.action}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
            <Sun size={24} />
          </div>
          <div>
            <h4 className="font-bold">System Status</h4>
            <p className="text-sm text-slate-400">All systems operational. Next sync in 5 mins.</p>
          </div>
        </div>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>
    </div>
  );
}
