import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Plus, CheckCircle2, Trash2, Clock, Sparkles, Save } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useUser } from '../context/UserContext';


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Medicines({ user }) {
  const [medicines, setMedicines] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', time: '09:00', dosage: '' });
  const { settings } = useUser();
  const isLight = settings?.theme === 'light';
  const { speak } = useVoice();


  useEffect(() => {
    fetchMedicines();
    speak(`Namaste ${user?.name || ""}, yeh aapki dawaiyon ki list hai`, "hi-IN");
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get(`${API_URL}/medicine/${user.id || user._id}`);
      setMedicines(res.data);
    } catch (error) {
      speak("Dawai load nahi ho paayi", "hi-IN");
    }
  };

  const addMedicine = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/medicine`, { ...newMed, userId: user.id || user._id });
    setShowAdd(false);
    setNewMed({ name: '', time: '09:00', dosage: '' });
    fetchMedicines();
    speak(`${newMed.name} add ho gayi hai`, "hi-IN");
  };

  const markAsTaken = async (id, name) => {
    await axios.put(`${API_URL}/medicine/${id}`, { taken: true });
    fetchMedicines();
    speak(`${name} le li gayi hai`, "hi-IN");
  };

  const deleteMed = async (id) => {
    await axios.delete(`${API_URL}/medicine/${id}`);
    fetchMedicines();
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-500 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-gradient-to-br from-slate-900 to-slate-950 text-white'}`}>


      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className={`text-4xl md:text-5xl font-black flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Sparkles className="text-indigo-400 w-8 h-8 md:w-12 md:h-12" />
            {settings?.language === 'Hindi' ? 'Aapki Dawaiyan' : 'Your Medicines'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Keep track of your health and prescriptions.</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 font-bold transition-all active:scale-95"
        >
          {showAdd ? <Trash2 size={22} /> : <Plus size={22} />}
          {showAdd ? (settings?.language === 'Hindi' ? 'Band Karein' : 'Close') : (settings?.language === 'Hindi' ? 'Nayi Dawai' : 'Add New')}
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={addMedicine} 
            className={`${isLight ? 'bg-white border-slate-200 shadow-xl' : 'bg-slate-900/50 border-white/5 shadow-2xl'} backdrop-blur-lg p-6 md:p-8 rounded-[2.5rem] border mb-10 space-y-6`}
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Medicine Name</label>
              <input
                className={isLight ? "input-field-light text-2xl py-6" : "input-field text-2xl py-6"}
                placeholder="e.g. Paracetamol"
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Schedule Time</label>
                <input
                  type="time"
                  className={isLight ? "input-field-light text-2xl py-6" : "input-field text-2xl py-6"}
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Dosage Details</label>
                <input
                  className={isLight ? "input-field-light text-2xl py-6" : "input-field text-2xl py-6"}
                  placeholder="e.g. 1 Tablet after food"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                />
              </div>
            </div>

            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl text-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-4">
              <Save size={28} /> {settings?.language === 'Hindi' ? 'Dawai Save Karein' : 'Save Medicine'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Medicine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {medicines.length > 0 ? (
          medicines.map((med) => (
            <div
              key={med._id}
              className={`group p-6 rounded-[2.5rem] border transition-all duration-300 ${
                med.taken
                  ? (isLight ? "bg-emerald-50/50 border-emerald-100 opacity-75" : "bg-emerald-500/5 border-emerald-500/10 opacity-60")
                  : (isLight ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-2xl" : "bg-slate-900/80 border-white/5 hover:border-white/20 hover:bg-slate-900 shadow-xl")
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className={`p-4 rounded-2xl ${med.taken ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                    <Pill size={32} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black truncate max-w-[150px] md:max-w-none ${med.taken ? 'line-through text-slate-400' : ''}`}>
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 font-bold mt-1">
                      <Clock size={16} /> {med.time}
                    </div>
                  </div>
                </div>
                {med.taken && (
                  <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    Taken
                  </div>
                )}
              </div>

              <div className={`p-4 rounded-2xl mb-6 ${isLight ? 'bg-slate-50' : 'bg-white/5'}`}>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Dosage</p>
                <p className={`text-lg font-bold ${med.taken ? 'text-slate-400' : (isLight ? 'text-slate-700' : 'text-slate-200')}`}>
                  {med.dosage || "No info"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!med.taken ? (
                  <button
                    onClick={() => markAsTaken(med._id, med.name)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    <CheckCircle2 size={20} /> Mark Taken
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 text-slate-500 font-bold py-4 bg-slate-500/10 rounded-xl">
                    Completed
                  </div>
                )}

                <button
                  onClick={() => deleteMed(med._id)}
                  className="p-4 text-rose-500 bg-rose-500/10 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={`col-span-full py-24 text-center rounded-[3rem] border-2 border-dashed ${isLight ? 'border-slate-200 bg-white/50' : 'border-slate-800 bg-slate-900/30'}`}>
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Pill size={48} className="text-indigo-400" />
            </div>
            <h3 className="text-3xl font-black text-slate-400">No medicines added</h3>
            <p className="text-slate-500 mt-2 text-lg">Click "Add New" to start tracking your health.</p>
          </div>
        )}
      </div>
    </div>
  );
}