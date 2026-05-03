import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  User, 
  Languages, 
  Volume2, 
  Bell, 
  Users, 
  PhoneCall, 
  Mic, 
  Lock, 
  LogOut, 
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Moon,
  Sun
} from 'lucide-react';

export default function Settings() {
  const { user, logout, updateProfile, settings, updateSettings } = useUser();
  const isLight = settings.theme === 'light';
  const [saveStatus, setSaveStatus] = useState(null);

  const [caregiverId, setCaregiverId] = useState('');

  const handleUpdateSetting = (key, value) => {
    updateSettings({ [key]: value });
    showSaveStatus();
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      name: formData.get('name'),
    };
    updateProfile(updates);
    updateSettings({ age: formData.get('age') });
    showSaveStatus();
  };

  const showSaveStatus = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleLinkCaregiver = () => {
    if (caregiverId) {
      handleUpdateSetting('caregiverName', caregiverId); // Simulating link
      setCaregiverId('');
    }
  };

  const handleSendTestAlert = () => {
    alert("Test alert sent to " + settings.emergencyContact);
  };

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      description: 'Personalize your identity and UI experience.',
      content: (
        <form onSubmit={handleUpdateProfile} className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Display Name</label>
              <input 
                name="name"
                type="text" 
                defaultValue={user?.name}
                className={isLight ? "input-field-light" : "input-field"} 
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Age (Optional)</label>
              <input 
                name="age"
                type="number" 
                defaultValue={settings.age}
                className={isLight ? "input-field-light" : "input-field"} 
                placeholder="Enter your age"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-auto px-8 flex items-center gap-2">
            <Save size={18} />
            Save Profile
          </button>
        </form>
      )
    },
    {
      id: 'language',
      title: 'Language & Voice Settings',
      icon: Languages,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-400/10',
      description: 'Choose your preferred language and AI voice speed.',
      content: (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Languages size={14} /> Select Language
              </label>
              <div className="flex gap-2">
                {['Hindi', 'English'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleUpdateSetting('language', lang)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                      settings.language === lang 
                        ? 'border-indigo-500 bg-indigo-500/20 text-white' 
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {lang === 'Hindi' ? 'Hindi 🇮🇳' : 'English 🇬🇧'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Volume2 size={14} /> Voice Speed
              </label>
              <div className="flex gap-2">
                {['Slow', 'Normal'].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleUpdateSetting('voiceSpeed', speed)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                      settings.voiceSpeed === speed 
                        ? 'border-indigo-500 bg-indigo-500/20 text-white' 
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {speed} {speed === 'Slow' && '(Recommended)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: Bell,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      description: 'Manage how and when you get reminded.',
      content: (
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
              <div>
                <h4 className="font-bold">Medicine Reminders</h4>
                <p className="text-sm text-slate-400">Get alerts for your scheduled doses.</p>
              </div>
              <button 
                onClick={() => handleUpdateSetting('medicineReminders', !settings.medicineReminders)}
                className={`w-14 h-7 rounded-full transition-all relative ${settings.medicineReminders ? 'bg-indigo-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${settings.medicineReminders ? 'left-8' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-2xl border border-slate-700">
              <div>
                <h4 className="font-bold">Voice Reminders</h4>
                <p className="text-sm text-slate-400">AI will speak out reminders aloud.</p>
              </div>
              <button 
                onClick={() => handleUpdateSetting('voiceReminders', !settings.voiceReminders)}
                className={`w-14 h-7 rounded-full transition-all relative ${settings.voiceReminders ? 'bg-indigo-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${settings.voiceReminders ? 'left-8' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Clock size={14} /> Reminder Repeat Time
            </label>
            <div className="flex gap-2">
              {[5, 10].map((time) => (
                <button
                  key={time}
                  onClick={() => handleUpdateSetting('reminderRepeatTime', time)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                    settings.reminderRepeatTime === time 
                      ? 'border-indigo-500 bg-indigo-500/20 text-white' 
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {time} Minutes
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'caregiver',
      title: 'Caregiver Linking',
      icon: Users,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      description: 'Connect with a family member or caregiver.',
      content: (
        <div className="p-6 space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Connected Caregiver</p>
                <p className="text-lg font-bold">{settings.caregiverName || 'None'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-400">Link New Caregiver</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={caregiverId}
                onChange={(e) => setCaregiverId(e.target.value)}
                className={isLight ? "input-field-light" : "input-field"} 
                placeholder="Enter Caregiver ID or Email"
              />
              <button 
                onClick={handleLinkCaregiver}
                className="px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all whitespace-nowrap"
              >
                Link Caregiver
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      icon: PhoneCall,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      description: 'Setup your primary contact for emergencies.',
      content: (
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Emergency Phone Number</label>
            <div className="flex gap-2">
              <input 
                type="tel" 
                value={settings.emergencyContact}
                onChange={(e) => handleUpdateSetting('emergencyContact', e.target.value)}
                className={isLight ? "input-field-light" : "input-field"} 
                placeholder="+91 XXXXX XXXXX"
              />
              <button 
                onClick={handleSendTestAlert}
                className="px-6 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
              >
                <AlertCircle size={18} />
                Send Test Alert
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'voice-help',
      title: 'Voice Commands Help',
      icon: Mic,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      description: 'Guidance on how to talk to MemoAi.',
      content: (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "Add medicine", a: "“Dawai add karo”" },
              { q: "I took my medicine", a: "“Maine dawai le li”" },
              { q: "What medicines are left?", a: "“Kaunsi dawai baaki hai?”" },
              { q: "Set a reminder", a: "“Reminder laga do”" }
            ].map((cmd, i) => (
              <div key={i} className="p-4 bg-slate-800/40 border border-slate-700 rounded-2xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Mic size={16} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">{cmd.q}</p>
                  <p className="font-bold text-lg">{cmd.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'smart-ai',
      title: 'Smart AI Features',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      description: 'Advanced AI summaries for your daily routine.',
      content: (
        <div className="p-6">
          <div className="flex items-center justify-between p-6 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-3xl border border-yellow-500/20">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Daily Summary</h4>
                <p className="text-sm text-slate-400 max-w-md">
                  AI will say: “Aaj aapne 2 dawai le li hain, 1 baaki hai” at the end of the day.
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdateSetting('dailySummary', !settings.dailySummary)}
              className={`w-14 h-7 rounded-full transition-all relative ${settings.dailySummary ? 'bg-yellow-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${settings.dailySummary ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'appearance',
      title: 'Appearance Mode',
      icon: Moon,
      color: 'text-sky-400',
      bgColor: 'bg-sky-400/10',
      description: 'Switch between light and dark visual themes.',
      content: (
        <div className="p-6">
          <div className="flex gap-4">
            {[
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleUpdateSetting('theme', mode.id)}
                className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                  settings.theme === mode.id 
                    ? 'border-sky-500 bg-sky-500/10 ' + (isLight ? 'text-sky-600' : 'text-white')
                    : (isLight ? 'border-slate-200 bg-white text-slate-400 hover:border-slate-300' : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700')
                }`}
              >
                <mode.icon size={20} className={settings.theme === mode.id ? 'text-sky-500' : 'text-slate-500'} />
                <span className="font-bold">{mode.label}</span>
              </button>
            ))}
          </div>

        </div>
      )
    },
    {
      id: 'security',
      title: 'Security & Account',
      icon: Lock,
      color: 'text-slate-400',
      bgColor: 'bg-slate-400/10',
      description: 'Manage your password and sign out.',
      content: (
        <div className="p-6 flex flex-col md:flex-row gap-4">
          <button className={`${isLight ? 'btn-secondary-light' : 'btn-secondary'} flex-1 flex items-center justify-center gap-2`}>
            <Lock size={18} />
            Change Password
          </button>
          <button 
            onClick={logout}
            className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Logout Account
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`text-5xl font-black ${isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent'}`}>
            Settings
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Manage your profile, preferences, and emergency settings.
          </p>
        </div>
        
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20 animate-bounce">
            <CheckCircle2 size={16} />
            <span className="font-bold text-sm">Settings Saved!</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className={`${isLight ? 'glass-panel-light' : 'glass-panel'} overflow-hidden ${isLight ? 'border-slate-200' : 'border-white/5'} hover:border-indigo-500/30 transition-colors group`}>
            <div className="px-8 py-6 bg-slate-800/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${section.bgColor} flex items-center justify-center ${section.color} group-hover:scale-110 transition-transform`}>
                  <section.icon size={24} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{section.title}</h2>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{section.description}</p>
                </div>

              </div>
            </div>
            <div className={isLight ? 'bg-white' : 'bg-slate-900/20'}>
              {section.content}
            </div>

          </div>
        ))}
      </div>

      <div className="p-8 bg-indigo-600/10 rounded-[2rem] border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
        
        <div className="flex items-center gap-6 z-10">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.5)]">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h4 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>All Set!</h4>
            <p className="text-slate-400">Your preferences are automatically synced across devices.</p>
          </div>

        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 z-10">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-300">System Live</span>
        </div>
      </div>
    </div>
  );
}
