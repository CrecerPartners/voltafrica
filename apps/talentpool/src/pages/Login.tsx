import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    } else {
      navigate('/talent');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border border-gray-200"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600 shadow-sm">
            <LogIn size={24} />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-800">Welcome back</h2>
          <p className="mt-2 text-xs font-medium text-slate-400 uppercase tracking-widest">Sign in to your talent account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>
          )}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300"><Mail size={16} /></div>
                <input type="email" required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300"><Lock size={16} /></div>
                <input type="password" required className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="group relative flex w-full justify-center rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 focus:outline-none disabled:opacity-50 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest">
            {loading ? 'Authenticating...' : 'Sign in'}
            {!loading && <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />}
          </button>
        </form>
        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4 border-t border-gray-50">
          Need an account? <Link to="/signup" className="text-sky-600 hover:text-sky-700 ml-1">Join the Talent Pool</Link>
        </div>
      </motion.div>
    </div>
  );
}
