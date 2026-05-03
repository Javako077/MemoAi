import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  User, 
  Languages, 
  Stethoscope, 
  Save, 
  Mail, 
  Shield, 
  Camera, 
  Smartphone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useUser } from '../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function ElderProfile({ user: authUser }) {
  const { settings, updateSettings, updateProfile } = useUser();
  const isLight = settings?.theme === 'light';
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: authUser?.name || '',
    email: authUser?.email || '',
    age: '',
    language: settings?.language || 'English',
    conditions: '',
    emergencyContact: '',
    role: authUser?.role || 'elder',
    avatar: authUser?.avatar || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const { speak } = useVoice();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile/${authUser.id || authUser._id}`);
        if (res.data) {
          setProfile(prev => ({
            ...prev,
            ...res.data,
            name: authUser?.name || res.data.name || prev.name,
            email: authUser?.email || res.data.email || prev.email,
            role: authUser?.role || res.data.role || prev.role,
            avatar: authUser?.avatar || res.data.avatar || prev.avatar
          }));
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
      }
    };
    fetchProfile();
  }, [authUser]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await axios.post(`${API_URL}/profile`, { 
        ...profile, 
        userId: authUser.id || authUser._id 
      });
      
      // Update local context for all relevant fields
      if (profile.language !== settings.language) {
        updateSettings({ language: profile.language });
      }

      updateProfile({ 
        name: profile.name, 
        role: profile.role, 
        avatar: profile.avatar 
      });
      
      setMessage({ type: 'success', text: settings?.language === 'Hindi' ? "Profile update ho gayi hai" : "Profile updated successfully" });
      speak(settings?.language === 'Hindi' ? "Profile update ho gayi hai" : "Profile updated", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={`min-h-screen p-6 md:p-12 transition-colors duration-500 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header & Avatar */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <User size={150} />
          </div>
          
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden ${!profile.avatar ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : ''}`}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(profile.name)
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all transform group-hover:scale-110 active:scale-95"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>

          <div className="text-center md:text-left space-y-2 z-10">
            <h1 className="text-4xl font-black tracking-tight">{profile.name || "User Name"}</h1>
            <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {profile.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${profile.role === 'elder' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {profile.role}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Personal Info Card */}
          <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-8 space-y-6`}>
            <h2 className="text-xl font-black flex items-center gap-3 border-b border-white/5 pb-4">
              <User className="text-indigo-400" /> Personal Info
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text"
                  className={isLight ? "input-field-light" : "input-field"}
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email (Read Only)</label>
                <div className={`${isLight ? 'bg-slate-100' : 'bg-slate-800/40'} p-3 rounded-xl border ${isLight ? 'border-slate-200' : 'border-white/5'} text-slate-500 cursor-not-allowed`}>
                  {profile.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    type="number"
                    className={isLight ? "input-field-light" : "input-field"}
                    value={profile.age}
                    onChange={e => setProfile({...profile, age: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    className={isLight ? "input-field-light" : "input-field"}
                    value={profile.role}
                    onChange={e => setProfile({...profile, role: e.target.value})}
                  >
                    <option value="elder">Elder</option>
                    <option value="caregiver">Caregiver</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Contact */}
          <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-8 space-y-6`}>
            <h2 className="text-xl font-black flex items-center gap-3 border-b border-white/5 pb-4">
              <Shield className="text-indigo-400" /> Settings & Contact
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preferred Language</label>
                <div className="flex gap-4">
                  {['English', 'Hindi'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setProfile({...profile, language: lang})}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${profile.language === lang 
                        ? 'border-indigo-600 bg-indigo-600/10 text-indigo-500' 
                        : (isLight ? 'border-slate-200 text-slate-400 hover:border-slate-300' : 'border-slate-800 text-slate-500 hover:border-slate-700')}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Emergency Contact</label>
                <div className="relative">
                  <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="tel"
                    className={`${isLight ? "input-field-light" : "input-field"} pl-12`}
                    placeholder="+91 XXXXX XXXXX"
                    value={profile.emergencyContact}
                    onChange={e => setProfile({...profile, emergencyContact: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Medical Conditions</label>
                <textarea 
                  className={`${isLight ? "input-field-light" : "input-field"} h-24 pt-3`}
                  placeholder="e.g. Diabetes, High BP..."
                  value={profile.conditions}
                  onChange={e => setProfile({...profile, conditions: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveProfile} 
          disabled={isSaving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-6 rounded-[2rem] text-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-4"
        >
          {isSaving ? (
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={28} />
              {settings?.language === 'Hindi' ? 'Badlav Save Karein' : 'Save Profile Changes'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

