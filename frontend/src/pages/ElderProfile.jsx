import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Languages, Stethoscope, Save } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function ElderProfile({ user }) {
  const [profile, setProfile] = useState({
    age: '',
    language: 'English',
    conditions: ''
  });
  const { speak } = useVoice();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile/${user.id || user._id}`);
        if (res.data._id) setProfile(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, [user]);

  const saveProfile = async () => {
    try {
      await axios.post(`${API_URL}/profile`, { ...profile, userId: user.id || user._id });
      speak("Profile update ho gayi hai", "hi-IN");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-elder-title">Mera Profile (Elder Profile) 👤</h1>

      <div className="elder-card space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-elder-body flex items-center gap-4">
              <User className="text-indigo-400" /> Age (Umar)
            </label>
            <input 
              type="number"
              className="input-elder"
              value={profile.age}
              onChange={e => setProfile({...profile, age: e.target.value})}
            />
          </div>

          <div className="space-y-4">
            <label className="text-elder-body flex items-center gap-4">
              <Languages className="text-indigo-400" /> Language (Bhasha)
            </label>
            <select 
              className="input-elder"
              value={profile.language}
              onChange={e => setProfile({...profile, language: e.target.value})}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-elder-body flex items-center gap-4">
            <Stethoscope className="text-indigo-400" /> Medical Conditions (Bimariyan)
          </label>
          <textarea 
            className="input-elder h-48"
            placeholder="e.g. Diabetes, High BP..."
            value={profile.conditions}
            onChange={e => setProfile({...profile, conditions: e.target.value})}
          />
        </div>

        <button onClick={saveProfile} className="btn-elder-success py-8">
          <Save size={40} /> Save Changes
        </button>
      </div>
    </div>
  );
}
