import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, supabase } from '@digihire/shared';
import { motion } from 'motion/react';
import { Mail, CheckCircle, RefreshCw, LogOut, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const { user, signOut } = useAuth();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!user?.email) return;
    setSending(true);
    setError('');
    const { error: err } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (err) setError(err.message);
    else setSuccess('Verification email sent! Check your inbox.');
    setSending(false);
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setError('');
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (freshUser?.email_confirmed_at) {
      setSuccess('Email verified! Redirecting...');
      setTimeout(() => navigate('/talent'), 1500);
    } else {
      setError('Email not yet verified. Click the link in your email and try again.');
    }
    setChecking(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm border border-gray-100 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-500">
          <Mail size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h1>
        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
          We've sent a verification link to <span className="font-bold text-slate-900">{user?.email}</span>.
          <span className="text-xs italic block mt-2 text-slate-400">Check your Spam folder if you don't see it.</span>
        </p>
        {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>}
        {success && <div className="mb-6 rounded-lg bg-green-50 p-4 text-[10px] font-bold text-green-500 uppercase tracking-widest border border-green-100">{success}</div>}
        <div className="space-y-4">
          <button onClick={handleCheckStatus} disabled={checking} className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest disabled:opacity-50">
            {checking ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />} I've Verified My Email
          </button>
          <button onClick={handleResend} disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-4 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-all uppercase tracking-widest disabled:opacity-50">
            {sending ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />} Resend Email
          </button>
        </div>
        <div className="mt-10 border-t border-gray-50 pt-8 flex justify-between items-center">
          <button onClick={() => signOut()} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
            <LogOut size={12} /> Sign Out
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Step 1.5 of 2 <ArrowRight size={12} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
