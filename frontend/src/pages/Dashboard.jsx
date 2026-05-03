import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  User, 
  HeartPulse, 
  Activity, 
  Mic, 
  PhoneCall, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  XCircle, 
  ArrowRight,
  Zap,
  Bell,
  Users,
  Sun,
  Moon,
  Coffee,
  ListTodo,
  Pill
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useUser } from '../context/UserContext';
import { useVoice } from '../hooks/useVoice';
import { translations } from '../utils/translations';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Dashboard() {
  const { user, settings } = useUser();
  const t = translations[settings.language] || translations.English;
  const { speak } = useVoice();
  const navigate = useNavigate();
  const isLight = settings?.theme === 'light';

  
  const [medicines, setMedicines] = useState([]);
  const [routine, setRoutine] = useState(null);
  const [profile, setProfile] = useState(null);
  const [adherenceData, setAdherenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastReminder, setLastReminder] = useState("5 min ago");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medsRes, routineRes, profileRes, statsRes] = await Promise.all([
          axios.get(`${API_URL}/medicine/${user.id || user._id}`),
          axios.get(`${API_URL}/routine/${user.id || user._id}`),
          axios.get(`${API_URL}/profile/${user.id || user._id}`),
          axios.get(`${API_URL}/stats/${user.id || user._id}`)
        ]);
        
        setMedicines(medsRes.data || []);
        setRoutine(routineRes.data);
        setProfile(profileRes.data);
        setAdherenceData(statsRes.data.adherenceData || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchData();
  }, [user]);

  // Smart Greeting Logic
  const greetingData = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = "Good Morning";
    let icon = Sun;
    let color = "text-yellow-400";
    
    if (hour >= 12 && hour < 17) {
      timeGreeting = "Good Afternoon";
      icon = Sun;
      color = "text-orange-400";
    } else if (hour >= 17 || hour < 5) {
      timeGreeting = "Good Evening";
      icon = Moon;
      color = "text-indigo-400";
    }

    const pendingCount = medicines.filter(m => !m.taken).length;
    const voiceText = settings?.language === 'Hindi' 
      ? `Namaste ${user?.name} ji, aaj aapki ${pendingCount} dawaiyan baaki hain.`
      : `Hello ${user?.name}, you have ${pendingCount} medicines pending today.`;

    return { timeGreeting, icon, color, voiceText, pendingCount };
  }, [user, medicines, settings]);

  // Speak greeting once data is loaded
  useEffect(() => {
    if (!loading && medicines.length > 0) {
      speak(greetingData.voiceText, settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
    }
  }, [loading, medicines.length]);

  const stats = useMemo(() => {
    const taken = medicines.filter(m => m.taken).length;
    const pending = medicines.filter(m => !m.taken).length;
    const missed = 0; // Simulated missed for now
    return { taken, pending, missed };
  }, [medicines]);

  const nextMedicine = useMemo(() => {
    if (medicines.length === 0) return null;
    const pendingMeds = medicines.filter(m => !m.taken);
    if (pendingMeds.length === 0) return null;
    
    // Simple sort by time (assuming HH:MM format)
    return pendingMeds.sort((a, b) => a.time.localeCompare(b.time))[0];
  }, [medicines]);

  const handleMarkAsTaken = async (id) => {
    try {
      await axios.put(`${API_URL}/medicine/${id}`, { taken: true });
      setMedicines(prev => prev.map(m => m._id === id ? { ...m, taken: true } : m));
      speak(settings?.language === 'Hindi' ? "Dawai le li gayi hai" : "Medicine marked as taken", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
    } catch (error) {
      console.error(error);
    }
  };

  const triggerSOS = () => {
    if (profile?.emergencyContact) {
      speak(settings?.language === 'Hindi' ? "Emergency Alert! Pariwar ko notify kiya ja raha hai." : "Emergency Alert! Notifying family.", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
      window.location.href = `tel:${profile.emergencyContact}`;
    } else {
      navigate('/emergency');
    }
  };

  // 9. Weekly Medicine Report
  const chartDataToRender = adherenceData.length > 0 ? adherenceData : [
    { day: 'Mon', taken: 0, total: 0 },
    { day: 'Tue', taken: 0, total: 0 },
    { day: 'Wed', taken: 0, total: 0 },
    { day: 'Thu', taken: 0, total: 0 },
    { day: 'Fri', taken: 0, total: 0 },
    { day: 'Sat', taken: 0, total: 0 },
    { day: 'Sun', taken: stats.taken, total: medicines.length },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 1. Smart Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br ${isLight ? 'from-indigo-50 via-white to-slate-100 border-slate-200 shadow-xl' : 'from-indigo-600/20 via-slate-800/40 to-slate-900 border-white/10'}`}
      >

        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <greetingData.icon className={`w-8 h-8 ${greetingData.color} animate-pulse`} />
              <span className="text-xl font-medium text-slate-400">{greetingData.timeGreeting}</span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t.greeting}, {user?.name}
            </h1>
            <p className={`text-xl mt-3 font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              {greetingData.voiceText}
            </p>
          </div>
          <div className={`${isLight ? 'bg-white shadow-lg border-slate-100' : 'bg-slate-900/60 border-white/5'} backdrop-blur-xl px-6 py-4 rounded-3xl border flex items-center gap-4`}>

            <div className="relative">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t.assistantLive}</p>
              <p className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{t.listeningCommands}</p>
            </div>

          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Next Med */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 2. Today Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-6 border-emerald-500/20 bg-emerald-500/5 group hover:bg-emerald-500/10 transition-colors`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">{t.medTaken}</p>
                  <p className="text-4xl font-black mt-1 text-emerald-500">{stats.taken}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>
            <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-6 border-amber-500/20 bg-amber-500/5 group hover:bg-amber-500/10 transition-colors`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">{t.medPending}</p>
                  <p className="text-4xl font-black mt-1 text-amber-500">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-500">
                  <Circle size={24} />
                </div>
              </div>
            </div>
            <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-6 border-rose-500/20 bg-rose-500/5 group hover:bg-rose-500/10 transition-colors`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-wider">{t.medMissed}</p>
                  <p className="text-4xl font-black mt-1 text-rose-500">{stats.missed}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-400/20 flex items-center justify-center text-rose-500">
                  <XCircle size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Next Medicine (Highlight Card) */}
          {nextMedicine ? (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative p-8 rounded-[2.5rem] bg-indigo-600 shadow-[0_20px_50px_rgba(79,70,229,0.4)] overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <HeartPulse size={120} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Activity size={40} />
                  </div>
                  <div>
                    <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{t.nextMed}</span>
                    <h2 className="text-4xl font-black text-white mt-2">{nextMedicine.name}</h2>
                    <div className="flex items-center gap-2 text-indigo-100 mt-2 font-bold text-lg">
                      <Clock size={20} /> {nextMedicine.time} • {nextMedicine.dosage}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleMarkAsTaken(nextMedicine._id)}
                  className="w-full md:w-auto bg-white text-indigo-600 font-black py-5 px-10 rounded-2xl text-xl shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={24} />
                  {t.markTaken}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className={`${isLight ? 'bg-white border-2 border-slate-100 shadow-lg' : 'bg-slate-800/40 border-2 border-dashed border-slate-700'} p-8 rounded-[2.5rem] text-center`}>
              <p className={`${isLight ? 'text-slate-500' : 'text-slate-400'} text-xl font-bold`}>{t.noMedToday}</p>
            </div>

          )}

          {/* 9. Weekly Medicine Report */}
          <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-8`}>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Activity className="text-indigo-500" /> {t.weeklyAdherence || 'Weekly Adherence'}
                </h3>
                <p className="text-slate-400">{t.consistencyDesc || 'Medicine consistency over the last 7 days.'}</p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20">
                <Zap className="text-yellow-400" size={20} />
                <span className="font-bold text-indigo-400">
                  {Math.round((chartDataToRender.reduce((acc, curr) => acc + curr.taken, 0) / (chartDataToRender.reduce((acc, curr) => acc + curr.total, 0) || 1)) * 100)}% {t.consistency || 'Consistency'}
                </span>
              </div>
            </div>
            <div className="w-full">
              <ResponsiveContainer width="99%" height={300}>
                <BarChart data={chartDataToRender} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTaken" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#334155"} vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: isLight ? '#64748b' : '#94a3b8', fontSize: 14, fontWeight: 'bold'}} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`${isLight ? 'bg-white shadow-2xl' : 'bg-slate-900'} p-4 rounded-2xl border ${isLight ? 'border-slate-100' : 'border-white/10'} shadow-xl`}>
                            <p className="font-bold text-lg mb-2">{data.day}</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-emerald-500">
                                <CheckCircle2 size={16} />
                                <span className="text-sm font-bold">{data.taken} {t.medTaken}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400">
                                <Pill size={16} />
                                <span className="text-sm font-medium">{data.total} {t.totalMeds || 'Total'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  
                  <Bar 
                    dataKey="taken" 
                    radius={[10, 10, 10, 10]} 
                    barSize={40}
                  >
                    {chartDataToRender.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.taken === entry.total && entry.total > 0 ? '#10b981' : '#6366f1'} 
                        fillOpacity={0.9}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Routine & Emergency */}
        <div className="space-y-8">
          
          {/* 4. Live Reminder Status */}
          <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-6 bg-indigo-500/5 border-indigo-500/20`}>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Bell size={24} className="animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold">Reminder Active</h4>
                <p className="text-sm text-slate-400 tracking-tight">Last alert sent {lastReminder}</p>
              </div>
            </div>
          </div>

          {/* 7. Emergency Button */}
          <button 
            onClick={triggerSOS}
            className="w-full group relative overflow-hidden p-8 rounded-[2.5rem] bg-rose-500 shadow-[0_20px_40px_rgba(244,63,94,0.3)] hover:shadow-rose-500/50 transition-all duration-500 active:scale-95"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col items-center gap-4 text-white">
              <AlertCircle size={64} className="animate-pulse" />
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">{t.emergency}</h3>
                <p className="text-rose-100 font-bold mt-1">{t.emergencyCall}</p>
              </div>
            </div>
          </button>

          {/* 6. Caregiver Status */}
          <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-6`}>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold">Caregiver Status</h4>
                <p className="text-sm text-slate-400">Connected to {settings?.caregiverName || "Family"}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/20 inline-block">
              {t.allOk}
            </div>
          </div>

          {/* 8. Routine Snapshot */}
          <div className={`${isLight ? 'glass-panel-light' : 'glass-panel'} p-6 space-y-4`}>

            <h3 className={`font-black text-lg flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <ListTodo size={20} className="text-indigo-400" /> {t.routineTasks}
            </h3>
            <div className="space-y-3">
              {routine?.tasks?.length > 0 ? (
                routine.tasks.slice(0, 4).map((task, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 ${isLight ? 'bg-slate-50' : 'bg-slate-800/30'} rounded-xl border ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-slate-500 shrink-0" />
                      )}
                      <span className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-400' : (isLight ? 'text-slate-700' : 'text-slate-200')}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-500 shrink-0 ml-2">{task.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm italic">No tasks scheduled</p>
                </div>
              )}
              {routine?.tasks?.length > 4 && (
                <Link to="/routine" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center justify-center gap-1 mt-2">
                  {t.viewAll} <ArrowRight size={12} />
                </Link>
              )}
          </div>
        </div>
      </div>
    </div>



      {/* 10. AI Smart Summary Section */}
      <div className={`${isLight ? 'glass-panel-light shadow-xl' : 'glass-panel'} p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20`}>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black">AI Daily Insight</h3>
            <p className="text-slate-400">Personalized feedback based on your activity.</p>
          </div>
        </div>
        <div className={`${isLight ? 'bg-white border-slate-100 shadow-inner' : 'bg-slate-900/60 border-white/5'} p-6 rounded-[2rem] border flex flex-col md:flex-row items-center gap-6`}>
          <div className="text-4xl">🧠</div>
          <p className={`text-xl italic font-medium leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {`"${stats.pending > 0 
              ? `You have ${stats.pending} doses left for today. Remember, consistency is key to health!` 
              : 'Excellent adherence today! You\'ve taken all your medications on time. Keep it up!'}"`}
          </p>
        </div>
      </div>

      {/* 9. AI Chat Shortcut */}
      <div className="flex justify-center">
        <Link 
          to="/chat"
          className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl border border-slate-700 transition-all group"
        >
          Ask Assistant <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>
    </div>
  );
}


