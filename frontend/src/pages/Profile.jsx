import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { User, Mail, Shield, Camera, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || 'Passionate learner using MemoAi to master new subjects.'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    // Simulate API call
    setTimeout(() => {
      updateProfile(formData);
      setIsSaving(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="text-slate-400 mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 flex flex-col items-center text-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-indigo-500/20">
                {formData.name?.[0] || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full border-4 border-slate-900 group-hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-bold mt-6">{formData.name}</h2>
            <p className="text-indigo-400 font-medium">Pro Member</p>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              {formData.bio}
            </p>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" /> Account Security
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Two-Factor Auth</span>
                <span className="text-emerald-400">Enabled</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Last Login</span>
                <span className="text-slate-300">Today, 2:45 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field pl-12" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field pl-12" 
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Bio</label>
              <textarea 
                rows="4"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="input-field resize-none"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <p className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-slate-400'}`}>
                {message || 'Changes are saved automatically to your session.'}
              </p>
              <button 
                disabled={isSaving}
                className="btn-primary flex items-center justify-center gap-2 max-w-[160px]"
              >
                {isSaving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
