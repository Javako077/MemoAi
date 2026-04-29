import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Coffee, Utensils, Footprints, Moon, Save } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Routine({ user }) {
  const [routine, setRoutine] = useState({
    wakeUp: '07:00 AM',
    breakfast: '08:30 AM',
    lunch: '01:30 PM',
    walk: '06:00 PM',
    dinner: '08:30 PM',
    sleep: '10:00 PM'
  });
  const { speak } = useVoice();

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await axios.get(`${API_URL}/routine/${user.id || user._id}`);
        if (res.data && res.data._id) setRoutine(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoutine();
    speak("Aapki dincharya", "hi-IN");
  }, [user]);

  const saveRoutine = async () => {
    try {
      await axios.post(`${API_URL}/routine`, { ...routine, userId: user.id || user._id });
      speak("Schedule save ho gaya hai", "hi-IN");
    } catch (error) {
      console.error(error);
    }
  };

  const items = [
    { key: 'wakeUp', label: 'Uthna (Wake Up)', icon: Sun, color: 'text-amber-400' },
    { key: 'breakfast', label: 'Nashta (Breakfast)', icon: Coffee, color: 'text-orange-400' },
    { key: 'lunch', label: 'Khana (Lunch)', icon: Utensils, color: 'text-emerald-400' },
    { key: 'walk', label: 'Tehalna (Walk)', icon: Footprints, color: 'text-indigo-400' },
    { key: 'dinner', label: 'Raat ka Khana', icon: Utensils, color: 'text-blue-400' },
    { key: 'sleep', label: 'Sona (Sleep)', icon: Moon, color: 'text-purple-400' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-elder-title">Dincharya (My Routine) 🌅</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.key} className="elder-card space-y-4">
            <div className="flex items-center gap-4">
              <item.icon className={`w-10 h-10 ${item.color}`} />
              <label className="text-2xl font-bold">{item.label}</label>
            </div>
            <input 
              type="text"
              className="input-elder"
              value={routine[item.key]}
              onChange={e => setRoutine({...routine, [item.key]: e.target.value})}
            />
          </div>
        ))}
      </div>

      <button onClick={saveRoutine} className="btn-elder-success py-8 mt-4">
        <Save size={40} /> Save Routine
      </button>
    </div>
  );
}
