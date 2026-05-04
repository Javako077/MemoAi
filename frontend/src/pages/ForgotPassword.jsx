import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset, resetPassword } from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await resetPassword(email, otp, newPassword);
      setMessage(res.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse-soft delay-700"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Back Button */}
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>

        <div className="glass-effect p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Key className="w-24 h-24" />
          </div>

          <div className="flex flex-col items-center mb-10 animate-fade-in">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4 p-2 relative group">
              <img src="/dosemateLogo.png" alt="DoseMate" className="w-full h-full object-contain" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-slate-900 group-hover:scale-110 transition-transform">
                {step === 1 ? <Mail size={18} /> : step === 2 ? <Key size={18} /> : <CheckCircle2 size={18} />}
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mt-4">Dose<span className="text-indigo-400">Mate</span></h2>
            <p className="text-slate-400 font-medium mt-2 text-center">
              {step === 1 
                ? "We'll send an OTP to your email to reset your password" 
                : step === 2 
                ? "Enter the 6-digit OTP sent to your email" 
                : "Your password has been successfully reset."}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl mb-8 text-sm font-medium flex items-center gap-2 animate-shake">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}
          {message && step !== 3 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl mb-8 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {message}
            </div>
          )}

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 mt-8 active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verify OTP & Reset */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">OTP Code</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="6-digit OTP" 
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 tracking-widest font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center mt-8 active:scale-95"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-center text-sm font-bold text-slate-400 hover:text-white mt-4 transition-colors"
              >
                Change Email Address
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="py-4">
                <p className="text-emerald-400 font-bold text-lg">Your password is ready!</p>
                <p className="text-slate-400 text-sm mt-2">You can now sign in with your new password.</p>
              </div>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Secure Authentication • Powered by DoseMate
        </p>
      </div>
    </div>
  );
}
