import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Megaphone, Users, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { useBrandCampaigns } from '../../hooks/useBrandCampaigns';
import { useRecruitmentRequests } from '../../hooks/useRecruitmentRequests';
import { useActivationRequests } from '../../hooks/useActivationRequests';

const ACTION_CARDS = [
  {
    icon: Megaphone,
    title: 'Launch a VoltSquad Campaign',
    desc: 'Deploy sellers to promote your product or service across our network.',
    to: '/brand/campaigns/new',
    color: 'bg-blue-50 text-[#2563eb] border-blue-100',
    btn: 'bg-[#2563eb] text-white',
  },
  {
    icon: Users,
    title: 'Submit Recruitment Request',
    desc: 'Request pre-vetted sales talent — BDRs, AEs, SDRs, and more.',
    to: '/brand/recruitment/new',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    btn: 'bg-violet-600 text-white',
  },
  {
    icon: Zap,
    title: 'Book an Activation',
    desc: 'Request field marketing support or book a strategy call with our team.',
    to: '/brand/activations',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    btn: 'bg-amber-500 text-white',
  },
  {
    icon: BarChart3,
    title: 'Track Activity',
    desc: 'View campaign performance, recruitment progress, and activation status.',
    to: '/brand/reports',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    btn: 'bg-emerald-600 text-white',
  },
];

export default function BrandHome() {
  const { profile } = useBrandProfile();
  const { campaigns } = useBrandCampaigns();
  const { requests: recruitmentRequests } = useRecruitmentRequests();
  const { requests: activationRequests } = useActivationRequests();

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const openRecruitment = recruitmentRequests.filter(r => r.status === 'open' || r.status === 'in_review').length;
  const pendingActivations = activationRequests.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#1a1a1a] to-[#2d2d2d] p-8 text-white shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Brand Portal</p>
        <h2 className="text-2xl font-extrabold mb-2">{profile?.company_name ?? 'Welcome back'}</h2>
        <p className="text-gray-400 text-sm">Select an action below to get started.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Active Campaigns" value={activeCampaigns} to="/brand/campaigns" />
        <Stat label="Open Requests" value={openRecruitment} to="/brand/recruitment" />
        <Stat label="Pending Activations" value={pendingActivations} to="/brand/activations" />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ACTION_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={card.to}
              className="group flex flex-col h-full rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-4 ${card.color}`}>
                <card.icon size={20} />
              </div>
              <h3 className="font-bold text-[#1a1a1a] mb-1">{card.title}</h3>
              <p className="text-xs text-gray-500 flex-1 leading-relaxed">{card.desc}</p>
              <div className={`mt-5 inline-flex items-center gap-1.5 self-start rounded-lg px-4 py-2 text-xs font-bold transition-all ${card.btn} group-hover:opacity-90`}>
                Get Started <ArrowRight size={13} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link to={to} className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:border-[#2563eb]/30 transition-all text-center">
      <p className="text-2xl font-extrabold text-[#1a1a1a]">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
    </Link>
  );
}
