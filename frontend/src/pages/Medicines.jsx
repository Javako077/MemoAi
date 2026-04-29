import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Plus, CheckCircle2, Trash2, Clock, Sparkles } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Medicines({ user }) {
  const [medicines, setMedicines] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', time: '09:00', dosage: '' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
          <Sparkles className="text-indigo-400" />
          Aapki Dawaiyan
        </h1>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-2xl shadow-lg"
        >
          <Plus size={22} /> Add
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={addMedicine} className="bg-white/5 backdrop-blur-lg p-6 rounded-3xl border border-white/10 mb-8 space-y-5 shadow-xl">

          <input
            className="w-full p-4 rounded-xl bg-black/30 border border-white/10 text-lg"
            placeholder="Medicine Name"
            value={newMed.name}
            onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              className="p-4 rounded-xl bg-black/30 border border-white/10 text-lg"
              value={newMed.time}
              onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
            />

            <input
              className="p-4 rounded-xl bg-black/30 border border-white/10 text-lg"
              placeholder="Dosage"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
            />
          </div>

          <button className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-lg font-semibold">
            Save Medicine
          </button>
        </form>
      )}

      {/* Medicine Cards */}
      <div className="grid md:grid-cols-2 gap-6">

        {medicines.map((med) => (
          <div
            key={med._id}
            className={`p-6 rounded-3xl border shadow-lg transition ${
              med.taken
                ? "bg-green-900/20 border-green-500/20"
                : "bg-white/5 border-white/10 hover:border-indigo-400"
            }`}
          >

            {/* Top */}
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Pill size={28} className="text-indigo-400" />
                </div>

                <div>
                  <h3 className="text-xl font-bold">{med.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock size={14} /> {med.time}
                  </p>
                </div>
              </div>

              {med.taken && (
                <span className="text-green-400 text-sm font-semibold">
                  ✓ Taken
                </span>
              )}
            </div>

            {/* Dosage */}
            <p className="mt-3 text-gray-300">
              💊 {med.dosage || "No dosage info"}
            </p>

            {/* Actions */}
            <div className="flex justify-between mt-5">
              {!med.taken ? (
                <button
                  onClick={() => markAsTaken(med._id, med.name)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl"
                >
                  <CheckCircle2 size={18} /> Taken
                </button>
              ) : (
                <div className="text-gray-500 text-sm">Completed</div>
              )}

              <button
                onClick={() => deleteMed(med._id)}
                className="text-red-400 hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty */}
        {medicines.length === 0 && (
          <div className="col-span-2 text-center py-20 border border-dashed rounded-3xl">
            <Pill size={50} className="mx-auto text-gray-500 mb-4" />
            <p className="text-lg text-gray-400">No medicines yet</p>
          </div>
        )}
      </div>
    </div>
  );
}