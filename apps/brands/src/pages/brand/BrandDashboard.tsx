import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@digihire/shared';
import { BrandProfile } from '../../types';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { motion } from 'motion/react';
import { Building2, Users, Target, Search } from 'lucide-react';
import BrandSetup from './BrandSetup';

export default function BrandDashboard() {
  const { user } = useAuth();
  const { profile, loading } = useBrandProfile();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Brand Portal...</div>;

  const isProfileComplete = !!profile?.industry;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-[#2563eb] text-2xl font-bold border-2 border-white shadow-md mb-4">
                  <Building2 />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a]">{profile?.company_name}</h2>
                <p className="text-sm text-[#8e8e8e]">{profile?.contact_name}</p>
              </div>
            </div>

            <nav className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100 space-y-1">
              <NavItem to="/brand" active={location.pathname === '/brand'} icon={<Building2 size={18} />} label="Overview" />
              <NavItem to="/brand/setup" active={location.pathname === '/brand/setup'} icon={<Target size={18} />} label="Company Profile" />
              <button
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 opacity-50 cursor-not-allowed"
              >
                <Search size={18} /> Find Talent
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          <Routes>
            <Route path="/" element={
              isProfileComplete ? (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-gradient-to-tr from-[#1a1a1a] to-[#333] p-10 text-white shadow-xl">
                    <h2 className="text-3xl font-extrabold mb-4">Welcome back, {profile?.contact_name || user?.user_metadata?.name}!</h2>
                    <p className="text-gray-400 max-w-lg mb-8">Access the most elite 1% of sales talent vetted by Digihire. Complete your profile details to see tailored matches.</p>
                    <div className="flex gap-4">
                      <Link to="/brand/setup" className="bg-[#2563eb] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-900">Manage Account</Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                      <h3 className="font-bold mb-4">Company Overview</h3>
                      <div className="space-y-3">
                        <InfoRow label="Industry" value={profile?.industry} />
                        <InfoRow label="Size" value={profile?.company_size} />
                        <InfoRow label="Location" value={`${profile?.city || ''}, ${profile?.country || ''}`} />
                        <InfoRow label="Goal" value={profile?.primary_goal || 'Not set'} />
                      </div>
                    </div>
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 text-[#2563eb] flex items-center justify-center mb-4"><Users size={24} /></div>
                      <h3 className="font-bold text-[#1a1a1a]">No Active Campaigns</h3>
                      <p className="text-xs text-gray-500 mt-1">Start a campaign to start receiving vetted talent matches instantly.</p>
                    </div>
                  </div>
                </div>
              ) : <BrandSetup />
            } />
            <Route path="/setup" element={<BrandSetup />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-[#1a1a1a] capitalize">{value || 'N/A'}</span>
    </div>
  );
}

function NavItem({ to, icon, label, active }: any) {
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
