import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { TalentProfile } from '../../types';
import { useTalentProfile } from '../../hooks/useTalentProfile';
import { motion } from 'motion/react';
import { UserCircle, GraduationCap, Settings, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';
import ProfileSetup from './ProfileSetup';
import TalentProfileView from './TalentProfileView';

export default function TalentDashboard() {
  const { user } = useAuth();
  const { profile, loading, setProfile } = useTalentProfile();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Profile...</div>;

  const isProfileComplete = profile?.status !== 'incomplete';
  const displayProgress = profile?.profile_completion || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold border-2 border-white shadow-sm overflow-hidden relative group">
                  {profile?.profile_photo_url ? (
                    <img src={profile.profile_photo_url} className="h-full w-full object-cover" alt="Profile" />
                  ) : (
                    user?.user_metadata?.name?.charAt(0) ?? '?'
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-800">{user?.user_metadata?.name}</h2>
                <p className="text-xs font-medium text-slate-400 tracking-wide">{user?.email}</p>

                <div className="mt-6 w-full space-y-4">
                   <StatusBadge status={profile?.status || 'incomplete'} />

                   {/* Progress Mini Bar */}
                   {profile?.status === 'incomplete' && (
                     <div className="pt-2 px-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          <span>Progress</span>
                          <span>{displayProgress}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${displayProgress}%`}}
                          />
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <nav className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100 space-y-1">
              <NavItem to="/talent" active={location.pathname === '/talent'} icon={<UserCircle size={18} />} label="View Profile" />
              <NavItem to="/talent/setup" active={location.pathname === '/talent/setup'} icon={<Settings size={18} />} label="Settings" />
              <div className="my-2 border-t border-gray-50 mx-2" />
              <NavItem to="/academy" active={false} icon={<GraduationCap size={18} />} label="Upskill Academy" />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <Routes>
            <Route path="/" element={
              isProfileComplete ? <TalentProfileView profile={profile!} /> : <Navigate to="/talent/setup" />
            } />
            <Route path="/setup" element={<ProfileSetup profile={profile} onUpdate={setProfile} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: React.ReactNode }> = {
    'incomplete':    { color: 'bg-gray-100 text-gray-600',      icon: <AlertCircle size={14} /> },
    'complete':      { color: 'bg-blue-100 text-[#2563eb]',     icon: <CheckCircle size={14} /> },
    'under_review':  { color: 'bg-yellow-100 text-yellow-700',  icon: <Clock size={14} /> },
    'shortlisted':   { color: 'bg-green-100 text-green-700',    icon: <Star size={14} /> },
    'matched':       { color: 'bg-purple-100 text-purple-700',  icon: <CheckCircle size={14} /> },
  };

  const config = configs[status] ?? configs['incomplete'];

  return (
    <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${config.color}`}>
      {config.icon}
      {status.replace('_', ' ')}
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active ? 'bg-[#2563eb] text-white shadow-blue-100 shadow-lg' : 'text-[#4a4a4a] hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
