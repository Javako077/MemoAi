import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, HeartPulse, Activity } from 'lucide-react';
import axios from 'axios';
import VoiceAssistant from '../components/VoiceAssistant';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Dashboard({ user }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const medsRes = await axios.get(`${API_URL}/medicine/${user.id || user._id}`);
        setMedicines(medsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboardData();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const takenMedsCount = medicines.filter(m => m.taken).length;
  const totalMedsCount = medicines.length;

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
            <p className="text-slate-400 mt-1">Here is your daily health overview.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/medicines" className="btn-primary hidden md:flex items-center gap-2 max-w-[200px]">
              <HeartPulse className="w-5 h-5" /> Manage Medicines
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-400/10 text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Medicines Today</p>
                <p className="text-2xl font-bold">{takenMedsCount} / {totalMedsCount} Taken</p>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-400/10 text-green-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Health Status</p>
                <p className="text-2xl font-bold">Good</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-400/10 text-amber-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Profile</p>
                <Link to="/profile" className="text-lg font-bold text-amber-400 hover:underline">View Profile</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8">
          <h2 className="text-xl font-bold mb-6">Upcoming Medicines</h2>
          <div className="space-y-4">
            {medicines.filter(m => !m.taken).length > 0 ? (
              medicines.filter(m => !m.taken).map(med => (
                <div key={med._id} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex justify-between items-center hover:bg-slate-800 transition-colors">
                  <div>
                    <h3 className="font-semibold text-indigo-400">{med.name}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1"><Clock size={14}/> {med.time} • {med.dosage}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">All caught up for today!</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

