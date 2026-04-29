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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 1 ? <Mail className="w-6 h-6" /> : step === 2 ? <Key className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6 text-green-400" />}
          </div>
          <h2 className="text-3xl font-bold">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Success!'}
          </h2>
          <p className="text-slate-400 mt-2">
            {step === 1 
              ? "We'll send an OTP to your email to reset your password" 
              : step === 2 
              ? "Enter the 6-digit OTP sent to your email" 
              : "Your password has been successfully reset."}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm relative z-10">
            {error}
          </div>
        )}
        {message && step !== 3 && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm relative z-10">
            {message}
          </div>
        )}

        {/* Step 1: Request OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4 relative z-10">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="input-field pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn-primary mt-6 flex items-center justify-center gap-2">
              {loading ? 'Sending...' : (
                <>
                  Send OTP <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP & Reset */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
            <div className="relative">
              <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="6-digit OTP" 
                className="input-field pl-12 tracking-widest font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required 
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                placeholder="New Password" 
                className="input-field pl-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required 
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn-primary mt-6">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-center text-sm text-slate-400 hover:text-white mt-4"
            >
              Change Email Address
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-6 relative z-10">
            <button onClick={() => navigate('/login')} className="btn-primary">
              Return to Login
            </button>
          </div>
        )}

        {/* Footer Link */}
        {step !== 3 && (
          <p className="text-center text-slate-400 mt-6 relative z-10 flex items-center justify-center gap-2 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Link to="/login" className="font-medium">Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}
