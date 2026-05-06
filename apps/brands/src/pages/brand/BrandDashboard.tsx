import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { Building2, Target, Megaphone, Users, Zap, BarChart3, LayoutDashboard } from 'lucide-react';
import BrandSetup from './BrandSetup';
import BrandHome from './BrandHome';
import CampaignLaunch from './CampaignLaunch';
import CampaignList from './CampaignList';
import CampaignDetail from './CampaignDetail';
import RecruitmentRequest from './RecruitmentRequest';
import RecruitmentDashboard from './RecruitmentDashboard';
import ActivationRequest from './ActivationRequest';
import Reports from './Reports';

const NAV = [
  { to: '/brand', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/brand/campaigns', label: 'Campaigns', icon: Megaphone, exact: false },
  { to: '/brand/recruitment', label: 'Recruitment', icon: Users, exact: false },
  { to: '/brand/activations', label: 'Activations', icon: Zap, exact: false },
  { to: '/brand/reports', label: 'Reports', icon: BarChart3, exact: false },
];

export default function BrandDashboard() {
  const { profile, loading } = useBrandProfile();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;

  const isProfileComplete = !!profile?.industry;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-3">
            {/* Brand card */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold border-2 border-white shadow-sm shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1a1a1a] truncate">{profile?.company_name ?? 'Your Brand'}</p>
                <p className="text-[10px] text-gray-400 truncate">{profile?.industry ?? 'Complete setup'}</p>
              </div>
            </div>

            {/* Primary nav */}
            <nav className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100 space-y-0.5">
              {NAV.map(item => {
                const active = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to) && item.to !== '/brand';
                const isOverview = item.to === '/brand';
                const overviewActive = isOverview && location.pathname === '/brand';
                const isActive = isOverview ? overviewActive : active;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-[#2563eb] text-white shadow-sm' : 'text-[#4a4a4a] hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Settings */}
            <nav className="rounded-2xl bg-white p-2 shadow-sm border border-gray-100">
              <Link
                to="/brand/setup"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === '/brand/setup' ? 'bg-[#2563eb] text-white shadow-sm' : 'text-[#4a4a4a] hover:bg-gray-50'
                }`}
              >
                <Target size={16} /> Company Profile
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-3 min-w-0">
          <Routes>
            <Route path="/" element={isProfileComplete ? <BrandHome /> : <BrandSetup />} />
            <Route path="/setup" element={<BrandSetup />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/new" element={<CampaignLaunch />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/recruitment" element={<RecruitmentDashboard />} />
            <Route path="/recruitment/new" element={<RecruitmentRequest />} />
            <Route path="/activations" element={<ActivationRequest />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
