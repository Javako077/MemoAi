import { Link, Navigate } from 'react-router-dom';
import { Heart, Bell, Brain, AlertCircle, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Home({ user }) {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Mesh Gradients for Premium Look */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <img src="/dosemateLogo.png" alt="DoseMate Logo" className="w-full h-full object-contain p-1" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Dose<span className="text-indigo-400">Mate</span></span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-white/5 transition-all">
            Login
          </Link>
          <Link to="/signup" className="px-5 py-2.5 text-sm font-bold rounded-xl bg-white text-slate-900 hover:bg-slate-200 shadow-xl transition-all">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-24 pb-20">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-fade-in">
             <Sparkles className="w-3.5 h-3.5" /> Next Gen Elderly Care
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tighter animate-slide-up">
            Your Personal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
              Memory Assistant
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed animate-fade-in delay-150">
            Helping you remember medicines, daily routines, and important tasks with friendly voice reminders and an AI companion that truly cares.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-slide-up delay-300">
            <Link
              to="/signup"
              className="group relative bg-indigo-600 hover:bg-indigo-500 text-lg font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              Start Free Today <Zap className="w-5 h-5 fill-current" />
            </Link>

            <Link
              to="/login"
              className="group bg-slate-800 hover:bg-slate-700 text-lg font-bold px-10 py-5 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-3"
            >
              Try Live Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-32">
          {[
            {
              icon: Bell,
              title: "Smart Reminders",
              desc: "Get gentle, timely alerts for your medications and routines so you never miss a beat.",
              color: "indigo"
            },
            {
              icon: Brain,
              title: "Memory Sync",
              desc: "A digital brain that organizes your day, helping you stay independent and confident.",
              color: "purple"
            },
            {
              icon: Heart,
              title: "Caring Voice",
              desc: "More than just an app — it's a friendly companion you can talk to naturally.",
              color: "rose"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-10 rounded-[32px] bg-slate-900/50 backdrop-blur-md border border-slate-800/50 hover:border-indigo-500/50 transition-all duration-500 hover:-translate-y-2 group shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-500/10 flex items-center justify-center mb-8 text-${feature.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold mb-4 text-white">
                {feature.title}
              </h3>

              <p className="text-slate-400 text-lg leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-32 p-10 md:p-20 rounded-[48px] bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <ShieldCheck className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-black">Family Trusted. Elderly Friendly.</h2>
            <p className="text-slate-300 text-lg md:text-xl font-medium">
              Designed specifically for ease of use, with large buttons and high-contrast visuals to ensure safety and peace of mind for your loved ones.
            </p>
            <div className="pt-6 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
               <span className="font-bold text-xl uppercase tracking-tighter">Safety First</span>
               <span className="font-bold text-xl uppercase tracking-tighter">Data Secure</span>
               <span className="font-bold text-xl uppercase tracking-tighter">24/7 Companion</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 font-medium">© 2026 DoseMate. Your companion for a better tomorrow.</p>
          <div className="flex gap-8 text-slate-500 font-bold text-sm">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Minimalist Bot icon for header
function Bot({ className }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}