import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { Settings } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.user_metadata?.name ?? user?.email ?? '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white font-bold text-xl">D</div>
            <span className="text-xl font-bold tracking-tight text-slate-800">digihire.io</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/academy" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">Academy</Link>
            {user && <Link to="/talent" className="text-[13px] font-semibold text-slate-500 hover:text-sky-600 transition-colors">My Profile</Link>}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-800">{displayName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">talent</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                {displayName.charAt(0)}
              </div>
              <button
                onClick={() => navigate('/talent')}
                className="p-2 text-slate-400 hover:text-sky-600 transition-all border border-transparent hover:border-sky-100 hover:bg-sky-50 rounded-lg"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 ml-2"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest">Login</Link>
              <Link to="/signup" className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-sky-200 hover:bg-sky-700 transition-all uppercase tracking-widest">
                Join Pool
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
