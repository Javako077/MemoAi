import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Save, 
  X,
  ListTodo,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import { useUser } from '../context/UserContext';
import { translations } from '../utils/translations';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export default function Routine({ user }) {
  const { settings } = useUser();
  const t = translations[settings.language] || translations.English;
  const isLight = settings?.theme === 'light';
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', time: '09:00', completed: false });
  const { speak } = useVoice();

  useEffect(() => {
    fetchRoutine();
    speak(settings?.language === 'Hindi' ? "Aapki dincharya load ho gayi hai" : "Your routine has been loaded", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
  }, [user]);

  const fetchRoutine = async () => {
    try {
      const res = await axios.get(`${API_URL}/routine/${user.id || user._id}`);
      if (res.data && res.data.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (error) {
      console.error("Fetch Routine Error:", error);
    }
  };

  const handleSaveRoutine = async (updatedTasks) => {
    try {
      await axios.post(`${API_URL}/routine`, { 
        userId: user.id || user._id, 
        tasks: updatedTasks 
      });
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Save Routine Error:", error);
    }
  };

  const addTask = (e) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const updatedTasks = [...tasks, { ...newTask, id: Date.now().toString() }];
    handleSaveRoutine(updatedTasks);
    setNewTask({ title: '', time: '09:00', completed: false });
    setShowAddModal(false);
    speak(settings?.language === 'Hindi' ? "Task add ho gaya" : "Task added successfully", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t._id !== id && t.id !== id);
    handleSaveRoutine(updatedTasks);
    speak(settings?.language === 'Hindi' ? "Task delete kar diya gaya" : "Task deleted", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(t => 
      (t._id === id || t.id === id) ? { ...t, completed: !t.completed } : t
    );
    handleSaveRoutine(updatedTasks);
    const task = updatedTasks.find(t => t._id === id || t.id === id);
    if (task.completed) {
      speak(settings?.language === 'Hindi' ? "Shabaash! Yeh kaam ho gaya." : "Great job! Task completed.", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setNewTask({ title: task.title, time: task.time, completed: task.completed });
    setShowAddModal(true);
  };

  const updateTask = (e) => {
    if (e) e.preventDefault();
    const updatedTasks = tasks.map(t => 
      (t._id === editingTask._id || t.id === editingTask.id) ? { ...newTask } : t
    );
    handleSaveRoutine(updatedTasks);
    setEditingTask(null);
    setNewTask({ title: '', time: '09:00', completed: false });
    setShowAddModal(false);
    speak(settings?.language === 'Hindi' ? "Task update ho gaya" : "Task updated", settings?.language === 'Hindi' ? 'hi-IN' : 'en-US');
  };

  return (
    <div className={`min-h-screen p-6 md:p-10 transition-colors duration-500 ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-indigo-500 w-6 h-6" />
              <span className="text-indigo-500 font-bold tracking-widest uppercase text-sm">{t.dailySchedule}</span>
            </div>
            <h1 className={`text-5xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t.myRoutine}
            </h1>
            <p className="text-slate-500 mt-2 text-lg">{t.manageActivities}</p>
          </div>
          
          <button 
            onClick={() => { setEditingTask(null); setShowAddModal(true); }}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 group"
          >
            <Plus className="group-hover:rotate-90 transition-transform" />
            {t.newTask}
          </button>
        </div>

        {/* Stats Overlay */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${isLight ? 'bg-white border-slate-100' : 'bg-slate-900/50 border-white/5'} border p-6 rounded-3xl shadow-sm flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <ListTodo size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t.totalTasks}</p>
              <p className="text-2xl font-black">{tasks.length}</p>
            </div>
          </div>
          <div className={`${isLight ? 'bg-white border-slate-100' : 'bg-slate-900/50 border-white/5'} border p-6 rounded-3xl shadow-sm flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t.completed}</p>
              <p className="text-2xl font-black text-emerald-500">{tasks.filter(t => t.completed).length}</p>
            </div>
          </div>
          <div className={`${isLight ? 'bg-white border-slate-100' : 'bg-slate-900/50 border-white/5'} border p-6 rounded-3xl shadow-sm flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{t.medPending}</p>
              <p className="text-2xl font-black text-amber-500">{tasks.filter(t => !t.completed).length}</p>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div 
                key={task._id || task.id || index}
                className={`group relative flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${
                  task.completed 
                    ? (isLight ? 'bg-emerald-50/50 border-emerald-100 opacity-75' : 'bg-emerald-500/5 border-emerald-500/10 opacity-60') 
                    : (isLight ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xl' : 'bg-slate-900/80 border-white/5 hover:border-white/20 hover:bg-slate-900 shadow-xl')
                }`}
              >
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <button 
                    onClick={() => toggleTask(task._id || task.id)}
                    className={`shrink-0 transition-transform active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-indigo-500'}`}
                  >
                    {task.completed ? <CheckCircle2 size={36} /> : <Circle size={36} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-2xl font-bold truncate transition-all ${task.completed ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 font-medium">
                      <Clock size={16} />
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(task)}
                    className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task._id || task.id)}
                    className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`py-20 text-center rounded-[3rem] border-2 border-dashed ${isLight ? 'border-slate-200 bg-white/50' : 'border-slate-800 bg-slate-900/30'}`}>
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-400">{t.noMedToday}</h3>
              <p className="text-slate-500 mt-2">{t.manageActivities}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`${isLight ? 'bg-white' : 'bg-slate-900'} w-full max-w-xl rounded-[2.5rem] border ${isLight ? 'border-slate-200 shadow-2xl' : 'border-white/10 shadow-[0_0_100px_rgba(79,70,229,0.2)]'} p-8 space-y-8 animate-in zoom-in-95 duration-300`}>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black">
                {editingTask ? t.editTask : t.newTask}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingTask ? updateTask : addTask} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2">{t.medName}</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Morning Walk, Read Book"
                  className={isLight ? "input-field-light text-2xl py-6" : "input-field text-2xl py-6"}
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2">{t.scheduleTime}</label>
                <input 
                  type="time"
                  required
                  className={isLight ? "input-field-light text-2xl py-6" : "input-field text-2xl py-6"}
                  value={newTask.time}
                  onChange={e => setNewTask({...newTask, time: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 rounded-2xl text-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-4">
                <Save size={28} />
                {editingTask ? (settings?.language === 'Hindi' ? 'Update Karein' : 'Update Task') : (settings?.language === 'Hindi' ? 'Save Karein' : 'Save Task')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

